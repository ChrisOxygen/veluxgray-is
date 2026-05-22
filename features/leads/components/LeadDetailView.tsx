"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Package,
  MessageSquare,
  Clock,
  BadgeCheck,
  Pencil,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ConvertLeadDialog } from "./ConvertLeadDialog";
import { useLeadDetail } from "@/features/leads/hooks/use-lead-detail";
import { useUpdateLead } from "@/features/leads/hooks/use-update-lead";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatNaira(amount: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-muted mt-0.5">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-5 w-24 rounded bg-muted" />
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {[120, 80, 100].map((h, i) => (
            <div key={i} className="rounded-xl bg-card border border-border" style={{ height: h }} />
          ))}
        </div>
        <div className="space-y-4">
          {[160, 120].map((h, i) => (
            <div key={i} className="rounded-xl bg-card border border-border" style={{ height: h }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeadDetailView({ id }: { id: string }) {
  const { data: lead, isPending } = useLeadDetail(id);
  const updateLead = useUpdateLead(id);

  const [notesValue, setNotesValue] = useState<string | null>(null);
  const [notesSaving, setNotesSaving] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);

  if (isPending) return <LeadDetailSkeleton />;
  if (!lead) {
    return (
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <Link href="/leads" className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={13} /> Back to Leads
        </Link>
        <p className="text-foreground font-medium">Lead not found.</p>
      </div>
    );
  }

  const currentNotes = notesValue ?? lead.notes ?? "";
  const notesChanged = currentNotes !== (lead.notes ?? "");
  const isConverted = lead.status === "CONVERTED";

  async function saveNotes() {
    setNotesSaving(true);
    try {
      await updateLead.mutateAsync({ notes: currentNotes });
      setNotesValue(null);
    } finally {
      setNotesSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      {/* Back */}
      <Link
        href="/leads"
        className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft size={13} /> Back to Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground font-heading">
            {lead.customerName}
          </h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Lead · {formatDate(lead.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConverted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSaleDialogOpen(true)}
              className="gap-1.5 border-border text-text-secondary"
            >
              <Pencil size={12} />
              Edit Sale
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setSaleDialogOpen(true)}
              className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <BadgeCheck size={13} />
              Mark as Sale
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Customer Info */}
          <Section title="Customer Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={[lead.city, lead.state].filter(Boolean).join(", ") || null}
              />
              <InfoRow icon={MapPin} label="Delivery Address" value={lead.deliveryAddress} />
            </div>
          </Section>

          {/* Order Info */}
          <Section title="Order">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Package} label="Product" value={`${lead.product.name}${lead.product.sku ? ` (${lead.product.sku})` : ""}`} />
              <InfoRow icon={Package} label="Quantity" value={String(lead.quantity)} />
              {lead.sale && (
                <InfoRow icon={BadgeCheck} label="Dispatch Fee" value={formatNaira(lead.sale.dispatchFee)} />
              )}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <div className="flex flex-col gap-3">
              <Textarea
                value={currentNotes}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add notes about this lead…"
                rows={4}
                className="resize-none bg-background border-border text-[13px] text-foreground placeholder:text-muted-foreground"
              />
              {notesChanged && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={saveNotes}
                    disabled={notesSaving}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover"
                  >
                    {notesSaving ? "Saving…" : "Save Notes"}
                  </Button>
                </div>
              )}
            </div>
          </Section>

          {/* WhatsApp Logs */}
          {lead.whatsappLogs.length > 0 && (
            <Section title="WhatsApp Logs">
              <div className="flex flex-col gap-3">
                {lead.whatsappLogs.map((log) => (
                  <div key={log.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={11} className="text-muted-foreground" />
                        <span className="text-[11px] font-medium text-text-secondary capitalize">
                          {log.direction}
                        </span>
                        <span className="text-[11px] text-muted-foreground">→ {log.recipient}</span>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                          log.status === "delivered"
                            ? "bg-[#EBF5F0] border-[#2D7A51]/20 text-[#2D7A51]"
                            : log.status === "failed"
                              ? "bg-error-subtle border-destructive/20 text-destructive"
                              : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-foreground bg-muted rounded-lg px-3 py-2 leading-relaxed">
                      {log.message}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">{formatDate(log.sentAt)}</p>
                    <Separator className="mt-1" />
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Status */}
          <Section title="Status">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <LeadStatusBadge status={lead.status} />
                {isConverted && (
                  <span className="text-[11px] text-muted-foreground">
                    · Converted
                  </span>
                )}
              </div>
              {!isConverted && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] text-muted-foreground">Change status</p>
                  <Select
                    value={lead.status}
                    onValueChange={(val) =>
                      updateLead.mutate({ status: val as "FRESH" | "CONTACTED" | "LOST" })
                    }
                    disabled={updateLead.isPending}
                  >
                    <SelectTrigger className="h-8 text-[12.5px] border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRESH">Fresh</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10.5px] text-muted-foreground">
                    To mark as converted, use &ldquo;Mark as Sale&rdquo; above.
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            {lead.events.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">No events yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {lead.events.map((event, i) => (
                  <li key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />
                      {i < lead.events.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      {event.oldStatus && event.newStatus ? (
                        <p className="text-[12.5px] text-foreground leading-snug">
                          Status changed from{" "}
                          <span className="font-medium">{event.oldStatus.toLowerCase()}</span>
                          {" → "}
                          <span className="font-medium">{event.newStatus.toLowerCase()}</span>
                        </p>
                      ) : (
                        <p className="text-[12.5px] text-foreground leading-snug">Event recorded</p>
                      )}
                      {event.note && (
                        <p className="text-[11.5px] text-text-secondary mt-0.5">{event.note}</p>
                      )}
                      <p className="text-[10.5px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={9} />
                        {formatDate(event.changedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {/* Source */}
          {lead.sourceUrl && (
            <Section title="Source">
              <a
                href={lead.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-accent hover:underline break-all"
              >
                {lead.sourceUrl}
              </a>
            </Section>
          )}
        </div>
      </div>

      <ConvertLeadDialog
        open={saleDialogOpen}
        onOpenChange={setSaleDialogOpen}
        leadId={lead.id}
        leadName={lead.customerName}
        existingSale={
          lead.sale
            ? { id: lead.sale.id, dispatchFee: Number(lead.sale.dispatchFee) }
            : null
        }
      />
    </div>
  );
}
