"use client";

import { useState } from "react";
import { Loader2, BadgeCheck, Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ConvertLeadDialog } from "./ConvertLeadDialog";
import type { Lead } from "@/features/leads/types";

const TABLE_COLUMNS = [
  { label: "Customer", width: "22%" },
  { label: "Product", width: "18%" },
  { label: "Phone", width: "14%" },
  { label: "Status", width: "11%" },
  { label: "Dispatch Fee", width: "13%" },
  { label: "Date", width: "12%" },
  { label: "", width: "10%" },
] as const;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatNaira(amount: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

interface LeadsTableProps {
  leads: Lead[];
  isFetching?: boolean;
}

export function LeadsTable({ leads, isFetching = false }: LeadsTableProps) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    leadId: string;
    leadName: string;
    existingSale: { id: string; dispatchFee: number } | null;
  }>({ open: false, leadId: "", leadName: "", existingSale: null });

  function openConvert(lead: Lead) {
    setDialogState({
      open: true,
      leadId: lead.id,
      leadName: lead.customerName,
      existingSale: null,
    });
  }

  function openEditSale(lead: Lead) {
    if (!lead.sale) return;
    setDialogState({
      open: true,
      leadId: lead.id,
      leadName: lead.customerName,
      existingSale: {
        id: lead.sale.id,
        dispatchFee: Number(lead.sale.dispatchFee),
      },
    });
  }

  if (!isFetching && leads.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-[14px] font-medium text-foreground">No leads found</p>
        <p className="text-[12.5px] text-muted-foreground">
          Leads will appear here when submitted from your landing pages.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden relative bg-card border border-border">
        {isFetching && (
          <div className="absolute top-3 right-3 z-10">
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table
            className={cn(
              "w-full border-collapse min-w-[800px] table-fixed transition-opacity duration-150",
              isFetching && "opacity-60",
            )}
          >
            <colgroup>
              {TABLE_COLUMNS.map(({ label, width }) => (
                <col key={label} style={{ width }} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-accent-subtle border-b border-border">
                {TABLE_COLUMNS.map(({ label }) => (
                  <th key={label} className="px-4 py-2.5 text-left">
                    {label && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap text-muted-foreground">
                        {label}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {leads.map((lead, index) => {
                const isLast = index === leads.length - 1;
                const isConverted = lead.status === "CONVERTED";

                return (
                  <tr
                    key={lead.id}
                    className={cn(
                      "transition-colors duration-100 hover:bg-accent-subtle/50",
                      !isLast && "border-b border-border",
                    )}
                  >
                    {/* Customer */}
                    <td className="px-4 py-3 max-w-0">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate text-foreground">
                          {lead.customerName}
                        </p>
                        {lead.state && (
                          <p className="text-[11.5px] text-muted-foreground truncate">
                            {lead.city ? `${lead.city}, ` : ""}{lead.state}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3 max-w-0">
                      <p className="text-[13px] truncate text-foreground">
                        {lead.product.name}
                      </p>
                      {lead.product.sku && (
                        <p className="text-[11px] font-mono text-muted-foreground truncate">
                          {lead.product.sku}
                        </p>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[12.5px] font-mono text-text-secondary">
                        {lead.phone}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <LeadStatusBadge status={lead.status} />
                    </td>

                    {/* Dispatch Fee */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isConverted && lead.sale ? (
                        <span className="text-[13px] font-semibold text-foreground">
                          {formatNaira(lead.sale.dispatchFee)}
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[12px] text-text-secondary">
                        {formatDate(lead.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-end">
                        {isConverted ? (
                          <button
                            type="button"
                            onClick={() => openEditSale(lead)}
                            className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-text-secondary"
                            title="Edit sale"
                          >
                            <Pencil size={12} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openConvert(lead)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-accent border border-accent/30 bg-accent-subtle hover:bg-accent/10 transition-colors whitespace-nowrap"
                            title="Mark as sale"
                          >
                            <BadgeCheck size={11} />
                            Mark as Sale
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConvertLeadDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
        leadId={dialogState.leadId}
        leadName={dialogState.leadName}
        existingSale={dialogState.existingSale}
      />
    </>
  );
}
