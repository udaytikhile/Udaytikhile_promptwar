import { Type } from "@google/genai";

/** Gemini JSON-mode response schema for analysis */
export const ANALYSIS_RESPONSE_CONFIG = {
  responseMimeType: "application/json" as const,
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      needs_more_info: { type: Type.BOOLEAN },
      clarifying_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
      visible_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
      assumptions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            evidence: { type: Type.STRING },
            why_it_matters: { type: Type.STRING },
            how_to_test: { type: Type.STRING },
          },
          required: ["text", "evidence", "why_it_matters", "how_to_test"],
        },
      },
      overlooked: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                "academics",
                "learning_quality",
                "long_term",
                "finances",
                "health_wellbeing",
                "relationships",
                "alternatives",
                "reversibility",
                "stakeholders",
                "upside",
                "other",
              ],
            },
            text: { type: Type.STRING },
            evidence: { type: Type.STRING },
          },
          required: ["category", "text", "evidence"],
        },
      },
      conflicts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            evidence: { type: Type.STRING },
          },
          required: ["text", "evidence"],
        },
      },
      questions: { type: Type.ARRAY, items: { type: Type.STRING } },
      safety_note: { type: Type.STRING, nullable: true },
    },
    required: [
      "needs_more_info",
      "visible_factors",
      "assumptions",
      "overlooked",
      "conflicts",
      "questions",
      "safety_note",
    ],
  },
};

/** Gemini JSON-mode response schema for follow-up reflection */
export const FOLLOWUP_RESPONSE_CONFIG = {
  responseMimeType: "application/json" as const,
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      shifts: { type: Type.ARRAY, items: { type: Type.STRING } },
      remaining_blind_spots: { type: Type.ARRAY, items: { type: Type.STRING } },
      reasoning_summary: { type: Type.STRING },
    },
    required: ["shifts", "remaining_blind_spots", "reasoning_summary"],
  },
};

export const STRICTER_REMINDER =
  "\n\nCRITICAL REMINDER: Your previous response contained directive language. You must NEVER use 'you should', 'I recommend', 'best option', 'better to', 'I suggest', 'go with', or 'you ought' in declarative statements. Rephrase using 'might', 'may', 'could', or frame as questions. Output only JSON.";
