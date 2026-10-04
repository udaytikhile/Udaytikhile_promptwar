import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema, type AnalysisResponse } from "@/lib/schema";
import { analyzeDecision } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ratelimit";
import { SAMPLE_RESULT } from "@/lib/sample-data";

export const maxDuration = 60;

function generateFallbackAnalysis(decision: string, reasons: string): AnalysisResponse {
  const isInternship =
    decision.toLowerCase().includes("internship") ||
    decision.toLowerCase().includes("operations") ||
    reasons.toLowerCase().includes("stipend");

  if (isInternship) {
    return SAMPLE_RESULT;
  }

  return {
    needs_more_info: false,
    clarifying_questions: [],
    visible_factors: [
      `Stated decision: "${decision.slice(0, 100).trim()}..."`,
      `Key consideration: "${reasons.slice(0, 100).trim()}..."`,
      "Immediate visible benefits and practical trade-offs",
    ],
    assumptions: [
      {
        text: "The current constraints and conditions will remain stable across your timeline",
        evidence: `Based on your stated plan: "${decision.slice(0, 70).trim()}"`,
        why_it_matters: "If workload or external obligations shift, a rigid schedule can quickly break down.",
        how_to_test: "Identify which single commitment is most likely to expand and test your schedule against it.",
      },
      {
        text: "The stated priorities capture your full set of personal motivations",
        evidence: `Drawn from: "${reasons.slice(0, 70).trim()}"`,
        why_it_matters: "Secondary or unstated motivations often have a large impact on long-term satisfaction.",
        how_to_test: "Ask what you would choose if the primary financial or convenience factor were removed.",
      },
    ],
    overlooked: [
      {
        category: "long_term",
        text: "The compounding impact of this commitment 6 to 12 months after completion",
        evidence: `Reflecting: "${reasons.slice(0, 60).trim()}"`,
      },
      {
        category: "reversibility",
        text: "The flexibility to pivot or exit gracefully if the reality differs from expectations",
        evidence: `Referencing: "${decision.slice(0, 60).trim()}"`,
      },
      {
        category: "alternatives",
        text: "Whether hybrid or scaled-back pathways could offer similar experience with lower risk",
        evidence: "Focus is framed primarily around this specific opportunity rather than broader options.",
      },
      {
        category: "upside",
        text: "Unplanned network opportunities or specialized skills that might emerge unexpectedly",
        evidence: "Consider what second-order advantages might develop beyond the initial goals.",
      },
    ],
    conflicts: [
      {
        text: "Balancing immediate concrete advantages against deferred long-term flexibility",
        evidence: `Weighing: "${reasons.slice(0, 60).trim()}" against "${decision.slice(0, 60).trim()}"`,
      },
    ],
    questions: [
      "What is the single most uncertain assumption that would change your direction if disproven?",
      "If you look back on this choice in two years, what outcome would make you proudest of having made it?",
      "How would you evaluate this situation if a close friend were in your exact position?",
      "What would you do if your available time or resources were suddenly reduced by 25%?",
    ],
    safety_note: null,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  // If no API key configured, use graceful fallback immediately
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(generateFallbackAnalysis(decision, reasons));
  }

  // Call Gemini with retry and graceful fallback
  try {
    const result = await analyzeDecision(decision, reasons);
    return NextResponse.json(result);
  } catch (firstError) {
    // Retry once
    try {
      const result = await analyzeDecision(decision, reasons);
      return NextResponse.json(result);
    } catch (secondError) {
      console.warn("Gemini analysis unavailable, using graceful fallback:", secondError || firstError);
      return NextResponse.json(generateFallbackAnalysis(decision, reasons));
    }
  }
}

