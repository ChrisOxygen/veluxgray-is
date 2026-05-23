import { prisma } from "@/shared/lib/prisma";
import type { ZCreateSale, ZUpdateSale } from "@/features/sales/schemas";

export class SaleError extends Error {
  constructor(
    public code: "NOT_FOUND" | "ALREADY_CONVERTED" | "INSUFFICIENT_STOCK",
    message: string,
  ) {
    super(message);
    this.name = "SaleError";
  }
}

export async function _createSale(data: ZCreateSale) {
  const lead = await prisma.lead.findUnique({
    where: { id: data.leadId },
    include: { product: true },
  });

  if (!lead) throw new SaleError("NOT_FOUND", "Lead not found");
  if (lead.status === "CONVERTED") {
    throw new SaleError("ALREADY_CONVERTED", "Lead is already converted");
  }

  const product = lead.product;
  if (product.inventoryCount < lead.quantity) {
    throw new SaleError(
      "INSUFFICIENT_STOCK",
      `Only ${product.inventoryCount} units in stock`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        leadId: data.leadId,
        dispatchFee: data.dispatchFee,
      },
    });

    await tx.lead.update({
      where: { id: data.leadId },
      data: { status: "CONVERTED" },
    });

    // Atomic check-and-decrement: only proceeds if sufficient stock still exists,
    // preventing a race where two concurrent conversions both pass the pre-check.
    const updated = await tx.product.updateMany({
      where: { id: product.id, inventoryCount: { gte: lead.quantity } },
      data: { inventoryCount: { decrement: lead.quantity } },
    });

    if (updated.count === 0) {
      throw new SaleError(
        "INSUFFICIENT_STOCK",
        `Only ${product.inventoryCount} units in stock`,
      );
    }

    await tx.leadEvent.create({
      data: {
        leadId: data.leadId,
        oldStatus: lead.status,
        newStatus: "CONVERTED",
        note: `Marked as sale. Dispatch fee: ₦${Number(data.dispatchFee).toLocaleString()}`,
      },
    });

    return sale;
  });
}

export async function _updateSaleDispatchFee(id: string, data: ZUpdateSale) {
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) throw new SaleError("NOT_FOUND", "Sale not found");

  return prisma.sale.update({
    where: { id },
    data: { dispatchFee: data.dispatchFee },
  });
}

export async function _getSaleByLeadId(leadId: string) {
  return prisma.sale.findUnique({ where: { leadId } });
}
