import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { ZLeadWebhookPayload } from "@/features/leads/schemas";
import {
  _getProductBySku,
  _checkDuplicateLead,
} from "@/features/leads/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import type { OnNewLeadPayload } from "@/trigger/on-new-lead";

export async function POST(request: Request) {
  // 1. Validate
  const body = await request.json();
  const parsed = ZLeadWebhookPayload.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  // 2. Verify product exists and is active
  const product = await _getProductBySku(parsed.data.sku);
  if (!product) {
    return apiError("not_found", "Product not found or no longer available", 404);
  }

  // 3. Duplicate check — same phone + product within 24 hours
  const isDuplicate = await _checkDuplicateLead(
    parsed.data.mainPhone,
    product.id,
  );
  if (isDuplicate) {
    return apiError(
      "bad_request",
      "A lead for this phone number and product already exists",
      400,
    );
  }

  // 4. Hand off to background task
  const taskPayload: OnNewLeadPayload = { ...parsed.data, productId: product.id };
  await tasks.trigger<typeof import("@/trigger/on-new-lead").onNewLead>(
    "on-new-lead",
    taskPayload,
  );

  return NextResponse.json(
    { message: "Lead received successfully." },
    { status: 202 },
  );
}
