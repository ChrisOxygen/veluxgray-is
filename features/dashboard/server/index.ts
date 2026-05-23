import { prisma } from "@/shared/lib/prisma";

export async function _getDashboardStats() {
  // Derive today's midnight in Africa/Lagos (WAT = UTC+1) so "leads today"
  // resets at Lagos midnight rather than UTC midnight (which is 1am Lagos time).
  const lagosDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const todayStart = new Date(`${lagosDate}T00:00:00+01:00`);

  const [
    leadsToday,
    totalLeads,
    convertedLeads,
    salesAggregate,
    activeProducts,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
    prisma.sale.aggregate({ _sum: { dispatchFee: true }, _count: true }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        inventoryCount: true,
        lowStockThreshold: true,
      },
      orderBy: { inventoryCount: "asc" },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        sale: { select: { dispatchFee: true } },
      },
    }),
  ]);

  const lowStockProducts = activeProducts
    .filter((p) => p.inventoryCount <= p.lowStockThreshold)
    .slice(0, 5);

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return {
    leadsToday,
    totalLeads,
    convertedLeads,
    conversionRate,
    totalSalesRevenue: Number(salesAggregate._sum.dispatchFee ?? 0),
    totalSalesCount: salesAggregate._count,
    lowStockProducts,
    recentLeads,
  };
}
