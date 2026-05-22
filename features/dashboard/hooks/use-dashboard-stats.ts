import { useQuery } from "@tanstack/react-query";

export type DashboardStats = {
  leadsToday: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalSalesRevenue: number;
  totalSalesCount: number;
  lowStockProducts: {
    id: string;
    name: string;
    sku: string | null;
    inventoryCount: number;
    lowStockThreshold: number;
  }[];
  recentLeads: {
    id: string;
    customerName: string;
    phone: string;
    status: string;
    createdAt: string;
    product: { id: string; name: string; sku: string | null };
    sale: { dispatchFee: string } | null;
  }[];
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      const res = await fetch("/api/v1/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
  });
}
