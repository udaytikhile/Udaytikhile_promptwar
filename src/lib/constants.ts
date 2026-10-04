/**
 * Centralized application constants and configuration limits.
 */

// Text length validation constraints
export const MIN_DECISION_CHARS = 10;
export const MAX_DECISION_CHARS = 1500;
export const MIN_REASONS_CHARS = 5;
export const MAX_REASONS_CHARS = 600;
export const MAX_ANSWER_CHARS = 500;

// Rate limiting (in-memory per-instance)
export const RATE_LIMIT_MAX_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;

// In-memory cache configuration
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const CACHE_MAX_ENTRIES = 100;

// Gemini API configuration
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
export const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
].filter(Boolean) as string[];

export const GEMINI_TIMEOUT_MS = 20_000;
export const GEMINI_ANALYSIS_MAX_TOKENS = 1200;
export const GEMINI_FOLLOWUP_MAX_TOKENS = 600;

// Serverless function settings
export const SERVERLESS_MAX_DURATION = 30;
export const VERCEL_REGION = "bom1";
