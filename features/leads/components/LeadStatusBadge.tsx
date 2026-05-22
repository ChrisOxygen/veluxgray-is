"use client";

import { cn } from "@/shared/lib/utils";
import type { LeadStatus } from "@/features/leads/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  FRESH: "bg-accent-subtle border-accent/30 text-accent",
  CONTACTED: "bg-[#EBF2FC] border-[#3B7DD8]/20 text-[#3B7DD8]",
  CONVERTED: "bg-[#EBF5F0] border-[#2D7A51]/20 text-[#2D7A51]",
  LOST: "bg-muted border-border-strong text-muted-foreground",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  FRESH: "Fresh",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
