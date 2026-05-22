import { NextResponse, after } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { ZLeadWebhookPayload } from "@/features/leads/schemas";
import {
  _getProductBySku,
  _checkDuplicateLead,
} from "@/features/leads/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import type { OnNewLeadPayload } from "@/trigger/on-new-lead";

const PRODUCTION_DOMAIN = "veluxgrayfashion.store";

function getAllowedOrigin(request: Request): string {
  const origin = request.headers.get("origin") ?? "";
  if (
    origin === `https://${PRODUCTION_DOMAIN}` ||
    origin.endsWith(`.${PRODUCTION_DOMAIN}`)
  ) {
    return origin;
  }
  const dev = process.env.NEXT_PUBLIC_LANDING_URL;
  if (dev && origin === dev) return origin;
  return "";
}

function corsHeaders(request: Request): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(request);
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);

  // 1. Validate
  const body = await request.json();
  const parsed = ZLeadWebhookPayload.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error, headers);

  // 2. Verify product exists and is active
  const product = await _getProductBySku(parsed.data.sku);
  if (!product) {
    return apiError("not_found", "Product not found or no longer available", 404, headers);
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
      headers,
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
    { status: 202, headers },
  );
}
