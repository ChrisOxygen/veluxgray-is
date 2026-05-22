"use client";

import Link from "next/link";
import { Loader2, BadgeCheck, Banknote, Pencil } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { ConvertLeadDialog } from "@/features/leads/components/ConvertLeadDialog";
import { useSales } from "@/features/sales/hooks/use-sales";

function formatNaira(amount: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

const TABLE_COLUMNS = [
  { label: "Customer", width: "22%" },
  { label: "Product", width: "22%" },
  { label: "Qty", width: "7%" },
  { label: "Dispatch Fee", width: "16%" },
  { label: "Location", width: "15%" },
  { label: "Date", width: "12%" },
  { label: "", width: "6%" },
] as const;

export function SalesView() {
  const { data, isPending, isFetching } = useSales();

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    saleId: string;
    leadId: string;
    leadName: string;
    dispatchFee: number;
  }>({ open: false, saleId: "", leadId: "", leadName: "", dispatchFee: 0 });

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground font-heading">
          Sales
        </h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          Converted leads with dispatch fees
        </p>
      </div>

      {/* Summary cards */}
      {isPending ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl p-4 bg-card border border-border animate-pulse flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1 pt-0.5">
                <div className="h-7 w-12 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-accent-subtle">
              <BadgeCheck size={15} className="text-accent" />
            </div>
            <div>
              <p className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none text-accent font-heading">
                {data?.count ?? 0}
              </p>
              <p className="text-[11px] sm:text-[12px] mt-1.5 text-muted-foreground">Total Sales</p>
            </div>
          </div>
          <div className="rounded-xl p-4 flex items-start gap-3 bg-card border border-border">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-muted">
              <Banknote size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none text-foreground font-heading">
                {formatNaira(data?.totalRevenue ?? 0)}
              </p>
              <p className="text-[11px] sm:text-[12px] mt-1.5 text-muted-foreground">Dispatch Cost</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isPending ? (
        <div className="rounded-xl bg-card border border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-b border-border last:border-0 flex items-center gap-4 animate-pulse">
              <div className="h-3.5 w-36 rounded bg-muted" />
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-3.5 w-20 rounded bg-muted ml-auto" />
            </div>
          ))}
        </div>
      ) : !data?.sales.length ? (
        <div className="rounded-xl bg-card border border-border flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-[14px] font-medium text-foreground">No sales yet</p>
          <p className="text-[12.5px] text-muted-foreground">
            Sales appear here when you convert a lead.
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden relative bg-card border border-border">
          {isFetching && !isPending && (
            <div className="absolute top-3 right-3 z-10">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className={cn("w-full border-collapse min-w-[700px] table-fixed", isFetching && !isPending && "opacity-60 transition-opacity")}>
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
                {data.sales.map((sale, index) => {
                  const isLast = index === data.sales.length - 1;
                  return (
                    <tr
                      key={sale.id}
                      className={cn(
                        "hover:bg-accent-subtle/50 transition-colors",
                        !isLast && "border-b border-border",
                      )}
                    >
                      <td className="px-4 py-3 max-w-0">
                        <Link
                          href={`/leads/${sale.leadId}`}
                          className="text-[13px] font-medium text-foreground hover:text-accent truncate block"
                        >
                          {sale.lead.customerName}
                        </Link>
                        <p className="text-[11.5px] font-mono text-muted-foreground truncate">
                          {sale.lead.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-0">
                        <p className="text-[13px] text-foreground truncate">{sale.lead.product.name}</p>
                        {sale.lead.product.sku && (
                          <p className="text-[11px] font-mono text-muted-foreground">{sale.lead.product.sku}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-foreground">{sale.lead.quantity}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] font-semibold text-foreground">
                          {formatNaira(sale.dispatchFee)}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-0">
                        <span className="text-[12.5px] text-text-secondary truncate block">
                          {sale.lead.state ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[12px] text-text-secondary">{formatDate(sale.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setEditDialog({
                              open: true,
                              saleId: sale.id,
                              leadId: sale.leadId,
                              leadName: sale.lead.customerName,
                              dispatchFee: Number(sale.dispatchFee),
                            })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-text-secondary"
                          title="Edit dispatch fee"
                        >
                          <Pencil size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConvertLeadDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog((s) => ({ ...s, open }))}
        leadId={editDialog.leadId}
        leadName={editDialog.leadName}
        existingSale={
          editDialog.saleId
            ? { id: editDialog.saleId, dispatchFee: editDialog.dispatchFee }
            : null
        }
      />
    </div>
  );
}
