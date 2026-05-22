"use client";

import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";
import { KpiCards } from "./KpiCards";
import { RecentLeads } from "./RecentLeads";
import { LowStockAlerts } from "./LowStockAlerts";

export function DashboardView() {
  const { data, isPending } = useDashboardStats();

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground font-heading">
          Overview
        </h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          {new Intl.DateTimeFormat("en-NG", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </p>
      </div>

      <KpiCards stats={data} isPending={isPending} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <RecentLeads leads={data?.recentLeads} isPending={isPending} />
        <LowStockAlerts products={data?.lowStockProducts} isPending={isPending} />
      </div>
    </div>
  );
}
