import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ZCreateSale } from "@/features/sales/schemas";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ZCreateSale) => {
      const res = await fetch("/api/v1/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "Failed to mark lead as sale");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}
