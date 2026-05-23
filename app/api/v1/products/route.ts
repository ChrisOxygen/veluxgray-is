import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import { ZCreateProductSchema } from "@/features/products/schemas";
import { _getProducts, _createProduct } from "@/features/products/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const rawStatus = searchParams.get("status") ?? "all";
  const status =
    rawStatus === "active" || rawStatus === "archived" ? rawStatus : "all";
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);

  try {
    const result = await _getProducts({ q, status, limit, page });
    return NextResponse.json(result);
  } catch {
    return apiError("internal_error", "Internal server error", 500);
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("bad_request", "Invalid JSON body", 400);
  }
  const parsed = ZCreateProductSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const product = await _createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[POST /api/v1/products] error:", err);
    if (err && typeof err === "object" && "code" in err) {
      if (err.code === "P2002") {
        return apiError("bad_request", "A product with this SKU already exists", 400);
      }
      const message = "message" in err && typeof err.message === "string" ? err.message : "Database error";
      return apiError("internal_error", message, 500);
    }
    return apiError("internal_error", "Internal server error", 500);
  }
}
