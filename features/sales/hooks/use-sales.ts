import { useQuery } from "@tanstack/react-query";

export type SaleItem = {
  id: string;
  leadId: string;
  dispatchFee: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: string;
    customerName: string;
    phone: string;
    state: string | null;
    quantity: number;
    createdAt: string;
    product: {
      id: string;
      name: string;
      sku: string | null;
      price: string;
    };
  };
};

export type SalesResponse = {
  sales: SaleItem[];
  totalRevenue: number;
  count: number;
};

interface UseSalesParams {
  productId?: string;
  from?: string;
  to?: string;
}

export function useSales({ productId, from, to }: UseSalesParams = {}) {
  return useQuery({
    queryKey: ["sales", { productId, from, to }],
    queryFn: async (): Promise<SalesResponse> => {
      const params = new URLSearchParams();
      if (productId) params.set("productId", productId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/v1/sales/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json();
    },
  });
}
