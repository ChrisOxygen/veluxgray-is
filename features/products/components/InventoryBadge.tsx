"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface InventoryBadgeProps {
  count: number;
  threshold: number;
}

export function InventoryBadge({ count, threshold }: InventoryBadgeProps) {
  const isLow = count <= threshold;
  const isEmpty = count === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11.5px] font-medium border",
        isEmpty
          ? "bg-error-subtle border-destructive/20 text-destructive"
          : isLow
            ? "bg-accent-subtle border-accent/30 text-accent-foreground"
            : "bg-background border-border text-text-secondary",
      )}
    >
      {(isEmpty || isLow) && <AlertTriangle size={10} className="shrink-0" />}
      {count}
    </span>
  );
}
