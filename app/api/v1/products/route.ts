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

  try {
    const result = await _getProducts({ q, status });
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

  const body = await request.json();
  const parsed = ZCreateProductSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const product = await _createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch {
    return apiError("internal_error", "Internal server error", 500);
  }
}
