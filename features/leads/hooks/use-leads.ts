import { useQuery } from "@tanstack/react-query";
import type { LeadsResponse } from "@/features/leads/types";

interface UseLeadsParams {
  status?: string;
  productId?: string;
  q?: string;
}

export function useLeads({ status, productId, q }: UseLeadsParams = {}) {
  return useQuery({
    queryKey: ["leads", { status, productId, q }],
    queryFn: async (): Promise<LeadsResponse> => {
      const params = new URLSearchParams();
      if (status && status !== "ALL") params.set("status", status);
      if (productId) params.set("productId", productId);
      if (q) params.set("q", q);

      const res = await fetch(`/api/v1/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });
}
