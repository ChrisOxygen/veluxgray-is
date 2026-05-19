import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { apiError, apiValidationError } from "@/shared/lib/api-error";
import { ZUpdateProductSchema } from "@/features/products/schemas";
import { _updateProduct, _archiveProduct, _restoreProduct } from "@/features/products/server";

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
  const parsed = ZUpdateProductSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  try {
    const product = await _updateProduct(id, parsed.data);
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return apiError("not_found", "Product not found", 404);
    }
    return apiError("internal_error", "Internal server error", 500);
  }
}

export async function DELETE(
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
  const body = await request.json().catch(() => ({}));
  const restore = body?.restore === true;

  try {
    const product = restore
      ? await _restoreProduct(id)
      : await _archiveProduct(id);
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return apiError("not_found", "Product not found", 404);
    }
    return apiError("internal_error", "Internal server error", 500);
  }
}
