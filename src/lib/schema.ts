import { z } from "zod";
import {
  MIN_DECISION_CHARS,
  MAX_DECISION_CHARS,
  MIN_REASONS_CHARS,
  MAX_REASONS_CHARS,
  MAX_ANSWER_CHARS,
} from "./constants";

// ─── Request Schemas ───

/** Schema for validating decision analysis requests */
export const AnalyzeRequestSchema = z.object({
  decision: z
    .string()
    .trim()
    .min(MIN_DECISION_CHARS, `Please describe your decision in at least ${MIN_DECISION_CHARS} characters.`)
    .max(MAX_DECISION_CHARS, `Decision must be ${MAX_DECISION_CHARS} characters or fewer.`),
  reasons: z
    .string()
    .trim()
    .min(MIN_REASONS_CHARS, "Please share what's driving your thinking.")
    .max(MAX_REASONS_CHARS, `Reasons must be ${MAX_REASONS_CHARS} characters or fewer.`),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/** Schema for validating follow-up reflection requests */
export const FollowupRequestSchema = z.object({
  decision: z.string().trim().min(MIN_DECISION_CHARS).max(MAX_DECISION_CHARS),
  reasons: z.string().trim().min(MIN_REASONS_CHARS).max(MAX_REASONS_CHARS),
  answers: z.record(z.string(), z.string().max(MAX_ANSWER_CHARS)),
});

export type FollowupRequest = z.infer<typeof FollowupRequestSchema>;

// ─── Response Components ───

export const AssumptionSchema = z.object({
  text: z.string(),
  evidence: z.string(),
  why_it_matters: z.string(),
  how_to_test: z.string(),
});

export type Assumption = z.infer<typeof AssumptionSchema>;

export const OverlookedCategorySchema = z.enum([
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
]);

export type OverlookedCategory = z.infer<typeof OverlookedCategorySchema>;

export const OverlookedSchema = z.object({
  category: OverlookedCategorySchema,
  text: z.string(),
  evidence: z.string(),
});

export type Overlooked = z.infer<typeof OverlookedSchema>;

export const ConflictSchema = z.object({
  text: z.string(),
  evidence: z.string(),
});

export type Conflict = z.infer<typeof ConflictSchema>;

// ─── Full Analysis Response ───

/** Complete decision reflection response payload */
export const AnalysisResponseSchema = z.object({
  needs_more_info: z.boolean(),
  clarifying_questions: z.array(z.string()).optional().default([]),
  visible_factors: z.array(z.string()),
  assumptions: z.array(AssumptionSchema),
  overlooked: z.array(OverlookedSchema),
  conflicts: z.array(ConflictSchema),
  questions: z.array(z.string()).min(3).max(5),
  safety_note: z.string().nullable(),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

// ─── Follow-up Response ───

/** Follow-up reflection response payload */
export const FollowupResponseSchema = z.object({
  shifts: z.array(z.string()),
  remaining_blind_spots: z.array(z.string()),
  reasoning_summary: z.string(),
});

export type FollowupResponse = z.infer<typeof FollowupResponseSchema>;
