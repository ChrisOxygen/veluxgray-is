import { useQuery } from "@tanstack/react-query";
import type { ProductsResponse } from "@/features/products/types";

interface UseProductsParams {
  q?: string;
  status?: string;
}

export function useProducts({ q, status }: UseProductsParams = {}) {
  return useQuery({
    queryKey: ["products", { q, status }],
    queryFn: async (): Promise<ProductsResponse> => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status && status !== "ALL") params.set("status", status.toLowerCase());

      const res = await fetch(`/api/v1/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}
