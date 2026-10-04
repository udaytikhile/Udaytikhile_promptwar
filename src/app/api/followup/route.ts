import { NextRequest, NextResponse } from "next/server";
import { FollowupRequestSchema, type FollowupResponse } from "@/lib/schema";
import { analyzeFollowup } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ratelimit";

export const maxDuration = 60;

function generateFallbackFollowup(decision: string, answers: Record<string, string>): FollowupResponse {
  const count = Object.keys(answers).length;
  return {
    shifts: [
      `Engaged with ${count} reflective question(s), crystallizing core priorities and constraints.`,
      "Shifted perspective from immediate trade-offs to testing critical assumptions.",
    ],
    remaining_blind_spots: [
      "Contingency planning if workload or unexpected obligations exceed initial forecasts.",
      "Validating unstated assumptions with trusted peers or mentors before final commitment.",
    ],
    reasoning_summary: `You are evaluating this decision by balancing concrete immediate benefits against academic and long-term commitments. Your answers reflect thoughtful engagement with key trade-offs while keeping the final decision in your hands.`,
  };
}

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

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(generateFallbackFollowup(decision, answers));
  }

  try {
    const result = await analyzeFollowup(decision, reasons, answers);
    return NextResponse.json(result);
  } catch (firstError) {
    try {
      const result = await analyzeFollowup(decision, reasons, answers);
      return NextResponse.json(result);
    } catch (secondError) {
      console.warn("Gemini followup unavailable, using graceful fallback:", secondError || firstError);
      return NextResponse.json(generateFallbackFollowup(decision, answers));
    }
  }
}

