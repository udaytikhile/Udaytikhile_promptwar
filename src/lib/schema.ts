import { z } from "zod";

// ─── Request Schemas ───

export const AnalyzeRequestSchema = z.object({
  decision: z
    .string()
    .trim()
    .min(10, "Please describe your decision in at least 10 characters.")
    .max(1500, "Decision must be 1500 characters or fewer."),
  reasons: z
    .string()
    .trim()
    .min(5, "Please share what's driving your thinking.")
    .max(600, "Reasons must be 600 characters or fewer."),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const FollowupRequestSchema = z.object({
  decision: z
    .string()
    .trim()
    .min(10)
    .max(1500),
  reasons: z
    .string()
    .trim()
    .min(5)
    .max(600),
  answers: z.record(z.string().max(500)),
});

export type FollowupRequest = z.infer<typeof FollowupRequestSchema>;

// ─── Assumption ───

const AssumptionSchema = z.object({
  text: z.string(),
  evidence: z.string(),
  why_it_matters: z.string(),
  how_to_test: z.string(),
});

export type Assumption = z.infer<typeof AssumptionSchema>;

// ─── Overlooked ───

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

const OverlookedSchema = z.object({
  category: OverlookedCategorySchema,
  text: z.string(),
  evidence: z.string(),
});

export type Overlooked = z.infer<typeof OverlookedSchema>;

// ─── Conflict ───

const ConflictSchema = z.object({
  text: z.string(),
  evidence: z.string(),
});

export type Conflict = z.infer<typeof ConflictSchema>;

// ─── Full Analysis Response ───

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

export const FollowupResponseSchema = z.object({
  shifts: z.array(z.string()),
  remaining_blind_spots: z.array(z.string()),
  reasoning_summary: z.string(),
});

export type FollowupResponse = z.infer<typeof FollowupResponseSchema>;
