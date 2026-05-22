import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError } from "@/shared/lib/api-error";
import { _getLeads } from "@/features/leads/server/leads";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const productId = searchParams.get("productId") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  try {
    const result = await _getLeads({ status, productId, q });
    return NextResponse.json(result);
  } catch {
    return apiError("internal_error", "Internal server error", 500);
  }
}
