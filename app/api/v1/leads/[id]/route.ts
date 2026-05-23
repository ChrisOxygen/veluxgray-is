import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import {
  _getLeadById,
  _updateLeadNotes,
  _updateLeadStatus,
} from "@/features/leads/server/detail";
import type { LeadStatus } from "@/prisma/generated/client/client";

const ZPatchLeadSchema = z
  .object({
    notes: z.string().optional(),
    status: z.enum(["FRESH", "CONTACTED", "LOST"]).optional(),
  })
  .refine((d) => d.notes !== undefined || d.status !== undefined, {
    message: "Provide at least one field to update",
  });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  const { id } = await params;
  const lead = await _getLeadById(id).catch(() => null);
  if (!lead) return apiError("not_found", "Lead not found", 404);

  return NextResponse.json(lead);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("bad_request", "Invalid JSON body", 400);
  }
  const parsed = ZPatchLeadSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    if (parsed.data.status !== undefined) {
      await _updateLeadStatus(id, parsed.data.status as LeadStatus);
    }
    if (parsed.data.notes !== undefined) {
      await _updateLeadNotes(id, parsed.data.notes);
    }
    const lead = await _getLeadById(id);
    return NextResponse.json(lead);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND")
        return apiError("not_found", "Lead not found", 404);
      if (err.message === "INVALID_STATUS")
        return apiError("bad_request", "Cannot set status to CONVERTED directly. Use the sale flow.", 400);
    }
    return apiError("internal_error", "Internal server error", 500);
  }
}
