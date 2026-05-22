import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError } from "@/shared/lib/api-error";
import { _getDashboardStats } from "@/features/dashboard/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return apiError("unauthorized", "Unauthorized", 401);

  try {
    const stats = await _getDashboardStats();
    return NextResponse.json(stats);
  } catch {
    return apiError("internal_error", "Internal server error", 500);
  }
}
