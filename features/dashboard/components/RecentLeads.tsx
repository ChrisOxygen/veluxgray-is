"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LeadStatusBadge } from "@/features/leads/components/LeadStatusBadge";
import type { DashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";
import type { LeadStatus } from "@/features/leads/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function RecentLeads({
  leads,
  isPending,
}: {
  leads?: DashboardStats["recentLeads"];
  isPending: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-[13px] font-semibold text-foreground">Recent Leads</h2>
        <Link
          href="/leads"
          className="flex items-center gap-1 text-[11.5px] text-accent hover:underline font-medium"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {isPending
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="h-2.5 w-20 rounded bg-muted" />
                </div>
                <div className="h-5 w-16 rounded-full bg-muted" />
              </div>
            ))
          : leads?.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="px-4 py-3 flex items-center gap-3 hover:bg-accent-subtle/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {lead.customerName}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground truncate">
                    {lead.product.name} · {formatDate(lead.createdAt)}
                  </p>
                </div>
                <LeadStatusBadge status={lead.status as LeadStatus} />
              </Link>
            ))}

        {!isPending && (!leads || leads.length === 0) && (
          <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
            No leads yet
          </div>
        )}
      </div>
    </div>
  );
}
