import { task, wait, logger } from "@trigger.dev/sdk";
import { prisma } from "@/shared/lib/prisma";
import { getWasender, checkWhatsAppNumber, toE164 } from "@/shared/lib/wasender";
import type { ZLeadWebhookPayload } from "@/features/leads/schemas";

export type OnNewLeadPayload = ZLeadWebhookPayload & { productId: string };

export const onNewLead = task({
  id: "on-new-lead",
  run: async (payload: OnNewLeadPayload, { ctx }) => {
    // Step 1 — Fetch product
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
        deliveryAddress: payload.deliveryAddress ?? null,
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
      // Step 4 — First message to customer
      const msg1 =
        `Hello ${customerName}. I just got your order for the *${product.name}*. ` +
        `My name is Chris, and I am a sales rep at Velux Gray Boutique. ` +
        `Let me confirm if the product is still available, I'd get back to you shortly 😊.`;

      try {
        await getWasender().sendText({ to: toE164(lead.phone), text: msg1 });
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

      // Step 5 — Wait 3 minutes, then send follow-up
      await wait.for({ minutes: 3 });

      const msg2 =
        `Okay, I just confirmed. We have four remaining. ` +
        `It's been our fastest selling item since yesterday. ` +
        `Should I send you some pictures of the *${product.name}*?`;

      try {
        await getWasender().sendText({ to: toE164(lead.phone), text: msg2 });
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
    }

    // Step 6 — Wait 1 minute, then notify owner (always fires)
    await wait.for({ minutes: 1 });

    const qty = lead.quantity;
    const statusLine = isOnWhatsApp
      ? `✅ *Contacted — welcome message + follow-up sent*`
      : `🔴 *Not on WhatsApp — call directly*`;

    const ownerAlert =
      `🛎️ *New Lead — Velux Gray*\n\n` +
      `${statusLine}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*Product:* ${product.name}\n` +
      `*Quantity:* ${qty}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*Name:* ${customerName}\n` +
      `*Phone:* ${lead.phone}\n` +
      (payload.altPhone ? `*Alt Phone:* ${payload.altPhone}\n` : "") +
      (lead.email ? `*Email:* ${lead.email}\n` : "") +
      (lead.state ? `*State:* ${lead.state}\n` : "") +
      (lead.deliveryAddress ? `*Delivery Address:* ${lead.deliveryAddress}\n` : "") +
      `━━━━━━━━━━━━━━━━━━`;

    const ownerPhone = process.env.WASENDERAPI_OWNER_PHONE;
    if (!ownerPhone) {
      logger.error("WASENDERAPI_OWNER_PHONE is not set — owner alert skipped");
    } else {
      try {
        await getWasender().sendText({
          to: toE164(ownerPhone),
          text: ownerAlert,
        });
        await prisma.whatsappLog.create({
          data: {
            leadId: lead.id,
            direction: "outbound",
            recipient: ownerPhone,
            message: ownerAlert,
            status: "sent",
          },
        });
      } catch (err) {
        logger.error("Failed to send owner alert", { err });
      }
    }

    logger.info("on-new-lead complete", { leadId: lead.id, isOnWhatsApp });
  },
});
