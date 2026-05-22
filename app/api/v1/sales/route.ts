import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import { ZCreateSaleSchema } from "@/features/sales/schemas";
import { _createSale, SaleError } from "@/features/sales/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  const body = await request.json();
  const parsed = ZCreateSaleSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const sale = await _createSale(parsed.data);
    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    if (err instanceof SaleError) {
      if (err.code === "NOT_FOUND")
        return apiError("not_found", err.message, 404);
      if (err.code === "ALREADY_CONVERTED")
        return apiError("bad_request", err.message, 400);
      if (err.code === "INSUFFICIENT_STOCK")
        return apiError("insufficient_stock", err.message, 422);
    }
    return apiError("internal_error", "Internal server error", 500);
  }
}
