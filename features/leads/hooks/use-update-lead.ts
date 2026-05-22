import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateLeadPayload {
  notes?: string;
  status?: "FRESH" | "CONTACTED" | "LOST";
}

export function useUpdateLead(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadPayload) => {
      const res = await fetch(`/api/v1/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "Failed to update lead");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
