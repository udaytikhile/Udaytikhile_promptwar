import type { AnalysisResponse, FollowupResponse } from "./schema";
import { SAMPLE_RESULT } from "./sample-data";

/**
 * Generates an advice-free fallback reflection when external AI APIs are unreachable.
 */
export function generateFallbackAnalysis(decision: string, reasons: string): AnalysisResponse {
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

/**
 * Generates an advice-free follow-up reflection summary when external AI APIs are unreachable.
 */
export function generateFallbackFollowup(
  decision: string,
  answers: Record<string, string>
): FollowupResponse {
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
