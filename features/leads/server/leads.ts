import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/prisma/generated/client/client";

interface GetLeadsParams {
  status?: string;
  productId?: string;
  q?: string;
}

export async function _getLeads({ status, productId, q }: GetLeadsParams = {}) {
  const where: Prisma.LeadWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as Prisma.EnumLeadStatusFilter;
  }

  if (productId) {
    where.productId = productId;
  }

  if (q) {
    where.OR = [
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true } },
      sale: true,
    },
  });

  return { leads, total: leads.length };
}
