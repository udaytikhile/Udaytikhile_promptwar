import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schema";
import { analyzeDecision } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ratelimit";

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in Vercel environment variables. Please add it in project settings and redeploy." },
      { status: 500 }
    );
  }

  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    );
  }

  // Parse & validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { decision, reasons } = parsed.data;

  // Call Gemini with retry
  try {
    const result = await analyzeDecision(decision, reasons);
    return NextResponse.json(result);
  } catch (firstError) {
    // Retry once
    try {
      const result = await analyzeDecision(decision, reasons);
      return NextResponse.json(result);
    } catch {
      console.error("Gemini analysis failed after retry:", firstError);
      return NextResponse.json(
        { error: "Analysis temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
  }
}
