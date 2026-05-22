"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { DashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

export function LowStockAlerts({
  products,
  isPending,
}: {
  products?: DashboardStats["lowStockProducts"];
  isPending: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-accent" />
          <h2 className="text-[13px] font-semibold text-foreground">Low Stock</h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-[11.5px] text-accent hover:underline font-medium"
        >
          Manage <ArrowRight size={11} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-2.5 w-16 rounded bg-muted" />
                </div>
                <div className="h-5 w-8 rounded bg-muted" />
              </div>
            ))
          : products?.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{p.name}</p>
                  {p.sku && (
                    <p className="text-[11px] font-mono text-muted-foreground">{p.sku}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[13px] font-bold text-accent">{p.inventoryCount}</span>
                  <p className="text-[10.5px] text-muted-foreground">/ {p.lowStockThreshold} min</p>
                </div>
              </div>
            ))}

        {!isPending && (!products || products.length === 0) && (
          <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
            All products are well stocked
          </div>
        )}
      </div>
    </div>
  );
}
