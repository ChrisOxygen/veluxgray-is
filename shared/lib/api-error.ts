import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type ErrorCode =
  | "unauthorized"
  | "validation_error"
  | "not_found"
  | "bad_request"
  | "insufficient_stock"
  | "internal_error";

export function apiError(code: ErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function apiValidationError(err: ZodError) {
  return NextResponse.json(
    {
      error: {
        code: "validation_error",
        message: "Validation failed",
        details: err.flatten(),
      },
    },
    { status: 422 },
  );
}
