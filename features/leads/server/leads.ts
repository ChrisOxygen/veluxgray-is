import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/prisma/generated/client/client";

interface GetLeadsParams {
  status?: string;
  productId?: string;
  q?: string;
  limit?: number;
  page?: number;
}

export async function _getLeads({ status, productId, q, limit = 100, page = 1 }: GetLeadsParams = {}) {
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

  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        product: { select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true } },
        sale: true,
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, limit };
}
