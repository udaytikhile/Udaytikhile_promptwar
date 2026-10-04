import { GoogleGenAI } from "@google/genai";
import { AnalysisResponseSchema, FollowupResponseSchema } from "./schema";
import type { AnalysisResponse, FollowupResponse } from "./schema";
import {
  ANALYZE_SYSTEM_PROMPT,
  FOLLOWUP_SYSTEM_PROMPT,
  buildAnalyzeUserPrompt,
  buildFollowupUserPrompt,
} from "./prompts";
import { findAdviceInResponse, stripAdviceItems } from "./guard";
import {
  CANDIDATE_MODELS,
  GEMINI_TIMEOUT_MS,
  GEMINI_ANALYSIS_MAX_TOKENS,
  GEMINI_FOLLOWUP_MAX_TOKENS,
} from "./constants";
import {
  ANALYSIS_RESPONSE_CONFIG,
  FOLLOWUP_RESPONSE_CONFIG,
  STRICTER_REMINDER,
} from "./gemini-config";
import {
  createAnalysisCacheKey,
  createFollowupCacheKey,
  getCachedItem,
  setCachedItem,
} from "./cache";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  responseConfig: typeof ANALYSIS_RESPONSE_CONFIG | typeof FOLLOWUP_RESPONSE_CONFIG,
  maxOutputTokens: number
): Promise<string> {
  const client = getClient();
  let lastError: unknown;

  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          ...responseConfig,
          maxOutputTokens,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("All candidate Gemini models failed");
}

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

/**
 * Analyzes a decision and reasoning with Gemini, utilizing caching and strict advice-free guards.
 */
export async function analyzeDecision(decision: string, reasons: string): Promise<AnalysisResponse> {
  const cacheKey = createAnalysisCacheKey(decision, reasons);
  const cached = getCachedItem<AnalysisResponse>(cacheKey);
  if (cached) return cached;

  const userPrompt = buildAnalyzeUserPrompt(decision, reasons);
  let rawText = await callGemini(
    ANALYZE_SYSTEM_PROMPT,
    userPrompt,
    ANALYSIS_RESPONSE_CONFIG,
    GEMINI_ANALYSIS_MAX_TOKENS
  );
  let parsed = AnalysisResponseSchema.parse(normalizeAnalysisPayload(JSON.parse(rawText)));

  const adviceFields = findAdviceInResponse(parsed);
  if (adviceFields.length > 0) {
    try {
      rawText = await callGemini(
        ANALYZE_SYSTEM_PROMPT + STRICTER_REMINDER,
        userPrompt,
        ANALYSIS_RESPONSE_CONFIG,
        GEMINI_ANALYSIS_MAX_TOKENS
      );
      const retryParsed = AnalysisResponseSchema.parse(normalizeAnalysisPayload(JSON.parse(rawText)));
      parsed = findAdviceInResponse(retryParsed).length === 0 ? retryParsed : stripAdviceItems(retryParsed);
    } catch {
      parsed = stripAdviceItems(parsed);
    }
  }

  setCachedItem(cacheKey, parsed);
  return parsed;
}

/**
 * Analyzes follow-up answers and returns reasoning shifts and remaining blind spots.
 */
export async function analyzeFollowup(
  decision: string,
  reasons: string,
  answers: Record<string, string>
): Promise<FollowupResponse> {
  const cacheKey = createFollowupCacheKey(decision, reasons, answers);
  const cached = getCachedItem<FollowupResponse>(cacheKey);
  if (cached) return cached;

  const userPrompt = buildFollowupUserPrompt(decision, reasons, answers);
  const rawText = await callGemini(
    FOLLOWUP_SYSTEM_PROMPT,
    userPrompt,
    FOLLOWUP_RESPONSE_CONFIG,
    GEMINI_FOLLOWUP_MAX_TOKENS
  );
  const parsed = FollowupResponseSchema.parse(JSON.parse(rawText));

  setCachedItem(cacheKey, parsed);
  return parsed;
}
