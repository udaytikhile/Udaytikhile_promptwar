import { describe, it, expect } from "vitest";
import { AnalyzeRequestSchema, AnalysisResponseSchema, FollowupRequestSchema, FollowupResponseSchema } from "@/lib/schema";

describe("schemas", () => {
  describe("AnalyzeRequestSchema", () => {
    it("accepts valid input", () => {
      const result = AnalyzeRequestSchema.safeParse({
        decision: "Should I take this internship for 6 months?",
        reasons: "Good stipend and close to home",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty decision", () => {
      const result = AnalyzeRequestSchema.safeParse({
        decision: "",
        reasons: "Some reasons here",
      });
      expect(result.success).toBe(false);
    });

    it("rejects oversized decision (>1500 chars)", () => {
      const result = AnalyzeRequestSchema.safeParse({
        decision: "x".repeat(1501),
        reasons: "Some reasons",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing reasons", () => {
      const result = AnalyzeRequestSchema.safeParse({
        decision: "A valid decision description here",
      });
      expect(result.success).toBe(false);
    });

    it("rejects oversized reasons (>600 chars)", () => {
      const result = AnalyzeRequestSchema.safeParse({
        decision: "A valid decision description here",
        reasons: "r".repeat(601),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("AnalysisResponseSchema", () => {
    it("validates a complete valid response", () => {
      const result = AnalysisResponseSchema.safeParse({
        needs_more_info: false,
        clarifying_questions: [],
        visible_factors: ["Factor A"],
        assumptions: [
          {
            text: "Assumption",
            evidence: "quote",
            why_it_matters: "matters",
            how_to_test: "test it",
          },
        ],
        overlooked: [
          { category: "academics", text: "Missed point", evidence: "quote" },
        ],
        conflicts: [{ text: "Tension", evidence: "quote" }],
        questions: ["Q1?", "Q2?", "Q3?"],
        safety_note: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects response with fewer than 3 questions", () => {
      const result = AnalysisResponseSchema.safeParse({
        needs_more_info: false,
        visible_factors: ["Factor A"],
        assumptions: [],
        overlooked: [],
        conflicts: [],
        questions: ["Q1?"],
        safety_note: null,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid overlooked category", () => {
      const result = AnalysisResponseSchema.safeParse({
        needs_more_info: false,
        visible_factors: [],
        assumptions: [],
        overlooked: [{ category: "nonexistent", text: "x", evidence: "y" }],
        conflicts: [],
        questions: ["Q1?", "Q2?", "Q3?"],
        safety_note: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("FollowupRequestSchema", () => {
    it("accepts valid followup input", () => {
      const result = FollowupRequestSchema.safeParse({
        decision: "Should I take the internship?",
        reasons: "Stipend is good",
        answers: { "Q1?": "I think so" },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("FollowupResponseSchema", () => {
    it("validates a valid followup response", () => {
      const result = FollowupResponseSchema.safeParse({
        shifts: ["Noticed timeline concern"],
        remaining_blind_spots: ["Career alignment unclear"],
        reasoning_summary: "The user is weighing practical benefits against academic risks.",
      });
      expect(result.success).toBe(true);
    });
  });
});
