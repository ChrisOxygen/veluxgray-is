import { NextResponse, after } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { ZLeadWebhookPayload } from "@/features/leads/schemas";
import {
  _getProductBySku,
  _checkDuplicateLead,
} from "@/features/leads/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import type { OnNewLeadPayload } from "@/trigger/on-new-lead";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_LANDING_URL ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  // 1. Validate
  const body = await request.json();
  const parsed = ZLeadWebhookPayload.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error, CORS_HEADERS);

  // 2. Verify product exists and is active
  const product = await _getProductBySku(parsed.data.sku);
  if (!product) {
    return apiError("not_found", "Product not found or no longer available", 404, CORS_HEADERS);
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
      CORS_HEADERS,
    );
  }

  // 4. Respond immediately, then hand off to background task
  const taskPayload: OnNewLeadPayload = { ...parsed.data, productId: product.id };
  after(async () => {
    await tasks.trigger<typeof import("@/trigger/on-new-lead").onNewLead>(
      "on-new-lead",
      taskPayload,
    );
  });

  return NextResponse.json(
    { message: "Lead received successfully." },
    { status: 202, headers: CORS_HEADERS },
  );
}
