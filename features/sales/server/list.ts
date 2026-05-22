import { prisma } from "@/shared/lib/prisma";

interface GetSalesParams {
  productId?: string;
  from?: string;
  to?: string;
}

export async function _getSales({ productId, from, to }: GetSalesParams = {}) {
  const sales = await prisma.sale.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(productId ? { lead: { productId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      lead: {
        select: {
          id: true,
          customerName: true,
          phone: true,
          state: true,
          quantity: true,
          createdAt: true,
          product: { select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true } },
        },
      },
    },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.dispatchFee), 0);

  return { sales, totalRevenue, count: sales.length };
}
