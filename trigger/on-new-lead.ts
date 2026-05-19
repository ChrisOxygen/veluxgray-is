import { task, wait, logger } from "@trigger.dev/sdk";
import { prisma } from "@/shared/lib/prisma";
import { wasender, checkWhatsAppNumber, toE164 } from "@/shared/lib/wasender";
import type { ZLeadWebhookPayload } from "@/features/leads/schemas";

export type OnNewLeadPayload = ZLeadWebhookPayload & { productId: string };

export const onNewLead = task({
  id: "on-new-lead",
  run: async (payload: OnNewLeadPayload, { ctx }) => {
    // Step 1 — Fetch product for name used in messages
    const product = await prisma.product.findUnique({
      where: { id: payload.productId },
      select: { id: true, name: true },
    });

    if (!product) {
      logger.error("Product not found in task", { productId: payload.productId });
      return;
    }

    const customerName = [payload.firstName, payload.lastName]
      .filter(Boolean)
      .join(" ");

    // Step 2 — Insert lead
    const lead = await prisma.lead.create({
      data: {
        productId: payload.productId,
        customerName,
        phone: payload.mainPhone,
        email: payload.email || null,
        state: payload.state ?? null,
        quantity: payload.quantity ? parseInt(payload.quantity, 10) : 1,
        sourceUrl: null,
        status: "FRESH",
        triggerRunId: ctx.run.id,
      },
    });

    logger.info("Lead created", { leadId: lead.id, phone: lead.phone });

    // Step 3 — Check if customer is on WhatsApp
    const isOnWhatsApp = await checkWhatsAppNumber(lead.phone);

    if (isOnWhatsApp) {
      // Step 4A — First message to customer
      const msg1 = `Hi ${customerName} 👋, thanks for your interest in the *${product.name}*!\n\nWe've received your order and will be in touch shortly. — Velux Gray`;

      try {
        await wasender.sendText({ to: toE164(lead.phone), text: msg1 });
        await prisma.whatsappLog.create({
          data: {
            leadId: lead.id,
            direction: "outbound",
            recipient: lead.phone,
            message: msg1,
            status: "sent",
          },
        });
      } catch (err) {
        logger.error("Failed to send first customer message", { err });
      }

      // Step 5A — Wait 30 minutes, then send follow-up
      await wait.for({ minutes: 30 });

      const msg2 = `Just checking in! 😊 Are you still interested in the *${product.name}*? Reply YES and we'll process your order right away. — Velux Gray`;

      try {
        await wasender.sendText({ to: toE164(lead.phone), text: msg2 });
        await prisma.whatsappLog.create({
          data: {
            leadId: lead.id,
            direction: "outbound",
            recipient: lead.phone,
            message: msg2,
            status: "sent",
          },
        });
        await prisma.lead.update({
          where: { id: lead.id },
          data: { whatsappSent: true },
        });
      } catch (err) {
        logger.error("Failed to send follow-up customer message", { err });
      }
    } else {
      // Step 4B — Customer not on WhatsApp: alert owner
      const noWaAlert = `🔴 *New Lead — No WhatsApp*\n\n*Name:* ${customerName}\n*Phone:* ${lead.phone}\n*Product:* ${product.name}\n*State:* ${lead.state ?? "N/A"}\n\nThis number is not on WhatsApp. You may need to call them directly.`;

      try {
        await wasender.sendText({
          to: toE164(process.env.WASENDERAPI_OWNER_PHONE!),
          text: noWaAlert,
        });
        await prisma.whatsappLog.create({
          data: {
            leadId: lead.id,
            direction: "outbound",
            recipient: process.env.WASENDERAPI_OWNER_PHONE!,
            message: noWaAlert,
            status: "sent",
          },
        });
      } catch (err) {
        logger.error("Failed to send no-WhatsApp owner alert", { err });
      }
    }

    // Step 6 — Owner alert (always runs)
    const ownerAlert = `✅ *New Lead*\n\n*Name:* ${customerName}\n*Phone:* ${lead.phone}\n*Product:* ${product.name}\n*State:* ${lead.state ?? "N/A"}\n*WhatsApp:* ${isOnWhatsApp ? "Yes" : "No"}`;

    try {
      await wasender.sendText({
        to: process.env.WASENDERAPI_OWNER_PHONE!,
        text: ownerAlert,
      });
      await prisma.whatsappLog.create({
        data: {
          leadId: lead.id,
          direction: "outbound",
          recipient: process.env.WASENDERAPI_OWNER_PHONE!,
          message: ownerAlert,
          status: "sent",
        },
      });
    } catch (err) {
      logger.error("Failed to send owner alert", { err });
    }

    logger.info("on-new-lead complete", {
      leadId: lead.id,
      isOnWhatsApp,
    });
  },
});
