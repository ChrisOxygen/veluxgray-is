import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@/features/leads/types";

type LeadDetail = Lead & {
  events: {
    id: string;
    leadId: string;
    oldStatus: string | null;
    newStatus: string | null;
    note: string | null;
    changedAt: string;
  }[];
  whatsappLogs: {
    id: string;
    direction: string;
    recipient: string;
    message: string;
    status: string;
    sentAt: string;
  }[];
};

export type { LeadDetail };

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async (): Promise<LeadDetail> => {
      const res = await fetch(`/api/v1/leads/${id}`);
      if (!res.ok) throw new Error("Failed to fetch lead");
      return res.json();
    },
    enabled: !!id,
  });
}
