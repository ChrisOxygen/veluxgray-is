import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError } from "@/shared/lib/api-error";
import { _getSales } from "@/features/sales/server/list";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  try {
    const result = await _getSales({ productId, from, to });
    return NextResponse.json(result);
  } catch {
    return apiError("internal_error", "Internal server error", 500);
  }
}
