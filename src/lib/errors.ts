import { NextResponse } from "next/server";

interface ApiErrorResponse {
  error: string;
}

/**
 * Creates a sanitized, consistent JSON error response without leaking stack traces or internal details.
 *
 * @param _error - The caught error object
 * @param status - HTTP status code (defaults to 500)
 * @param message - User-facing sanitized message
 */
export function createErrorResponse(
  _error: unknown,
  status = 500,
  message = "An unexpected error occurred. Please try again."
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status });
}
