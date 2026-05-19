"use client";

import { Package, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProductsStats } from "@/features/products/types";

interface ProductMetricsProps {
  stats?: ProductsStats;
  isPending?: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border animate-pulse">
      <div className="w-8 h-8 rounded-lg shrink-0 mt-0.5 bg-muted" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-7 w-10 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductMetrics({ stats, isPending = false }: ProductMetricsProps) {
  if (isPending || !stats) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-muted">
          <Package size={15} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none text-foreground font-heading">
            {stats.total}
          </p>
          <p className="text-[11px] sm:text-[12px] mt-1.5 leading-tight text-muted-foreground">
            Total Products
          </p>
        </div>
      </div>

      <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#EBF5F0]">
          <CheckCircle2 size={15} className="text-[#2D7A51]" />
        </div>
        <div className="min-w-0">
          <p className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none text-[#2D7A51] font-heading">
            {stats.active}
          </p>
          <p className="text-[11px] sm:text-[12px] mt-1.5 leading-tight text-muted-foreground">
            Active
          </p>
        </div>
      </div>

      <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-accent-subtle">
          <AlertTriangle size={15} className="text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none text-accent font-heading">
            {stats.lowStock}
          </p>
          <p className="text-[11px] sm:text-[12px] mt-1.5 leading-tight text-muted-foreground">
            Low Stock
          </p>
        </div>
      </div>
    </div>
  );
}
