import { prisma } from "@/shared/lib/prisma";
import type { Product } from "@/prisma/generated/client/client";

export async function _getProductBySku(
  sku: string,
): Promise<Product | null> {
  return prisma.product.findFirst({
    where: { sku, isActive: true },
  });
}

export async function _checkDuplicateLead(
  phone: string,
  productId: string,
): Promise<boolean> {
  const existing = await prisma.lead.findFirst({
    where: {
      phone,
      productId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { id: true },
  });

  return existing !== null;
}
