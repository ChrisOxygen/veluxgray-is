"use client";

import { useSearchParams } from "next/navigation";
import { LeadsTable } from "./LeadsTable";
import { useLeads } from "@/features/leads/hooks/use-leads";

const STATUS_FILTERS = ["ALL", "FRESH", "CONTACTED", "CONVERTED", "LOST"] as const;

export function LeadsView() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status")?.toUpperCase() ?? "ALL";
  const q = searchParams.get("q") ?? undefined;

  const { data, isPending, isFetching } = useLeads({ status, q });

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground font-heading">
            Leads
          </h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            {data ? `${data.total} lead${data.total !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_FILTERS.map((s) => {
          const isActive = status === s;
          const params = new URLSearchParams(searchParams.toString());
          if (s === "ALL") {
            params.delete("status");
          } else {
            params.set("status", s.toLowerCase());
          }
          const href = `?${params.toString()}`;

          return (
            <a
              key={s}
              href={href}
              className={
                isActive
                  ? "px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-primary text-primary-foreground"
                  : "px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-secondary hover:bg-muted transition-colors"
              }
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </a>
          );
        })}
      </div>

      {/* Table */}
      {isPending ? (
        <div className="rounded-xl bg-card border border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-4 py-3.5 border-b border-border last:border-0 flex items-center gap-4"
            >
              <div className="h-3.5 w-36 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-28 rounded bg-muted animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      ) : (
        <LeadsTable
          leads={data?.leads ?? []}
          isFetching={isFetching && !isPending}
        />
      )}
    </div>
  );
}
