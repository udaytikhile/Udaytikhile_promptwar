import { NextRequest, NextResponse } from "next/server";
import { FollowupRequestSchema } from "@/lib/schema";
import { analyzeFollowup } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = FollowupRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { decision, reasons, answers } = parsed.data;

  try {
    const result = await analyzeFollowup(decision, reasons, answers);
    return NextResponse.json(result);
  } catch (firstError) {
    try {
      const result = await analyzeFollowup(decision, reasons, answers);
      return NextResponse.json(result);
    } catch {
      console.error("Gemini followup failed after retry:", firstError);
      return NextResponse.json(
        { error: "Follow-up analysis temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
  }
}
