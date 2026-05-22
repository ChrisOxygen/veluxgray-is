import { prisma } from "@/shared/lib/prisma";
import type { LeadStatus } from "@/prisma/generated/client/client";

export async function _getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true, price: true } },
      sale: true,
      events: { orderBy: { changedAt: "desc" } },
      whatsappLogs: { orderBy: { sentAt: "desc" } },
    },
  });
}

export async function _updateLeadNotes(id: string, notes: string) {
  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) throw new Error("NOT_FOUND");
  return prisma.lead.update({ where: { id }, data: { notes } });
}

const ALLOWED_MANUAL_STATUSES: LeadStatus[] = ["FRESH", "CONTACTED", "LOST"];

export async function _updateLeadStatus(id: string, status: LeadStatus) {
  if (!ALLOWED_MANUAL_STATUSES.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!lead) throw new Error("NOT_FOUND");

  const [updated] = await prisma.$transaction([
    prisma.lead.update({ where: { id }, data: { status } }),
    prisma.leadEvent.create({
      data: {
        leadId: id,
        oldStatus: lead.status,
        newStatus: status,
      },
    }),
  ]);

  return updated;
}
