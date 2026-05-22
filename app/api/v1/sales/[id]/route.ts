import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import { ZUpdateSaleSchema } from "@/features/sales/schemas";
import { _updateSaleDispatchFee, SaleError } from "@/features/sales/server";

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
  const body = await request.json();
  const parsed = ZUpdateSaleSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const sale = await _updateSaleDispatchFee(id, parsed.data);
    return NextResponse.json(sale);
  } catch (err) {
    if (err instanceof SaleError && err.code === "NOT_FOUND") {
      return apiError("not_found", "Sale not found", 404);
    }
    return apiError("internal_error", "Internal server error", 500);
  }
}
