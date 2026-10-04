import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponseSchema, FollowupResponseSchema } from "./schema";
import type { AnalysisResponse, FollowupResponse } from "./schema";
import { ANALYZE_SYSTEM_PROMPT, FOLLOWUP_SYSTEM_PROMPT, buildAnalyzeUserPrompt, buildFollowupUserPrompt } from "./prompts";
import { findAdviceInResponse, stripAdviceItems } from "./guard";

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
].filter(Boolean) as string[];
const TIMEOUT_MS = 25_000;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

/** Gemini JSON-mode response schema for analysis */
const ANALYSIS_RESPONSE_CONFIG = {
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
                "academics", "learning_quality", "long_term", "finances",
                "health_wellbeing", "relationships", "alternatives",
                "reversibility", "stakeholders", "upside", "other",
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
      "needs_more_info", "visible_factors", "assumptions",
      "overlooked", "conflicts", "questions", "safety_note",
    ],
  },
};

const FOLLOWUP_RESPONSE_CONFIG = {
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

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  responseConfig: typeof ANALYSIS_RESPONSE_CONFIG | typeof FOLLOWUP_RESPONSE_CONFIG
): Promise<string> {
  const client = getClient();
  let lastError: unknown;

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          ...responseConfig,
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    } catch (err) {
      console.warn(`Gemini model ${model} failed, checking fallbacks:`, err);
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("All candidate Gemini models failed");
}

const STRICTER_REMINDER = "\n\nCRITICAL REMINDER: Your previous response contained directive language. You must NEVER use 'you should', 'I recommend', 'best option', 'better to', 'I suggest', 'go with', or 'you ought' in declarative statements. Rephrase using 'might', 'may', 'could', or frame as questions. Output only JSON.";

function normalizeAnalysisPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const p = payload as Record<string, unknown>;
  if (Array.isArray(p.questions)) {
    const fallbacks = [
      "What assumptions might you be making that are hardest to reverse?",
      "If you chose an alternative path, what would you most appreciate about that outcome?",
      "What new information would change your confidence if you knew it today?",
    ];
    for (const f of fallbacks) {
      if (p.questions.length >= 3) break;
      if (!p.questions.includes(f)) p.questions.push(f);
    }
    if (p.questions.length > 5) {
      p.questions = p.questions.slice(0, 5);
    }
  }
  return p;
}

export async function analyzeDecision(decision: string, reasons: string): Promise<AnalysisResponse> {
  const userPrompt = buildAnalyzeUserPrompt(decision, reasons);

  // First attempt
  let rawText = await callGemini(ANALYZE_SYSTEM_PROMPT, userPrompt, ANALYSIS_RESPONSE_CONFIG);
  const parsed = AnalysisResponseSchema.parse(normalizeAnalysisPayload(JSON.parse(rawText)));

  // Check for advice
  const adviceFields = findAdviceInResponse(parsed);
  if (adviceFields.length > 0) {
    // Retry with stricter prompt
    try {
      rawText = await callGemini(
        ANALYZE_SYSTEM_PROMPT + STRICTER_REMINDER,
        userPrompt,
        ANALYSIS_RESPONSE_CONFIG
      );
      const retryParsed = AnalysisResponseSchema.parse(normalizeAnalysisPayload(JSON.parse(rawText)));
      const retryAdvice = findAdviceInResponse(retryParsed);
      if (retryAdvice.length === 0) {
        return retryParsed;
      }
      // Still has advice — strip offending items
      return stripAdviceItems(retryParsed);
    } catch {
      // Retry failed — strip from original
      return stripAdviceItems(parsed);
    }
  }

  return parsed;
}

export async function analyzeFollowup(
  decision: string,
  reasons: string,
  answers: Record<string, string>
): Promise<FollowupResponse> {
  const userPrompt = buildFollowupUserPrompt(decision, reasons, answers);
  const rawText = await callGemini(FOLLOWUP_SYSTEM_PROMPT, userPrompt, FOLLOWUP_RESPONSE_CONFIG);
  return FollowupResponseSchema.parse(JSON.parse(rawText));
}
