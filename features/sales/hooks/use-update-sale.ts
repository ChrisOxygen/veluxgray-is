import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ZUpdateSale } from "@/features/sales/schemas";

export function useUpdateSale(saleId: string, leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ZUpdateSale) => {
      const res = await fetch(`/api/v1/sales/${saleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "Failed to update sale");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}
