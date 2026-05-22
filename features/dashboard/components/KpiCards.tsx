"use client";

import { Users2, TrendingUp, BadgeCheck, Banknote } from "lucide-react";
import type { DashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        <Icon size={15} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className={`text-[22px] sm:text-[26px] font-bold tracking-tight leading-none font-heading ${valueColor ?? "text-foreground"}`}>
          {value}
        </p>
        <p className="text-[11px] sm:text-[12px] mt-1.5 leading-tight text-muted-foreground">
          {label}
        </p>
        {sub && (
          <p className="text-[10.5px] mt-0.5 text-muted-foreground/70">{sub}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border animate-pulse">
      <div className="w-8 h-8 rounded-lg shrink-0 mt-0.5 bg-muted" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-7 w-12 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

export function KpiCards({
  stats,
  isPending,
}: {
  stats?: DashboardStats;
  isPending: boolean;
}) {
  if (isPending || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Leads Today"
        value={stats.leadsToday}
        sub={`${stats.totalLeads} total`}
        icon={Users2}
        iconBg="bg-muted"
        iconColor="text-muted-foreground"
      />
      <KpiCard
        label="Conversion Rate"
        value={`${stats.conversionRate}%`}
        sub={`${stats.convertedLeads} converted`}
        icon={TrendingUp}
        iconBg="bg-[#EBF5F0]"
        iconColor="text-[#2D7A51]"
        valueColor="text-[#2D7A51]"
      />
      <KpiCard
        label="Total Sales"
        value={stats.totalSalesCount}
        icon={BadgeCheck}
        iconBg="bg-accent-subtle"
        iconColor="text-accent"
        valueColor="text-accent"
      />
      <KpiCard
        label="Dispatch Revenue"
        value={formatNaira(stats.totalSalesRevenue)}
        icon={Banknote}
        iconBg="bg-muted"
        iconColor="text-muted-foreground"
      />
    </div>
  );
}
