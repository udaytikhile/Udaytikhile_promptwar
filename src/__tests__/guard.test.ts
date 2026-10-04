import { describe, it, expect } from "vitest";
import { containsAdvice, findAdviceInResponse, stripAdviceItems } from "@/lib/guard";

describe("guard", () => {
  it("flags advice statement: 'you should'", () => {
    expect(containsAdvice("You should take the internship.")).toBe(true);
  });

  it("flags advice statement: 'I recommend'", () => {
    expect(containsAdvice("I recommend going with option A.")).toBe(true);
  });

  it("flags 'best option'", () => {
    expect(containsAdvice("This is the best option for you.")).toBe(true);
  });

  it("passes neutral text", () => {
    expect(containsAdvice("This decision involves trade-offs between time and money.")).toBe(false);
  });

  it("passes a question containing 'should'", () => {
    expect(containsAdvice("Have you considered what you should prioritize?")).toBe(false);
  });

  it("passes tentative language ('might', 'could')", () => {
    expect(containsAdvice("You might want to consider the timeline.")).toBe(false);
  });

  it("findAdviceInResponse identifies nested advice", () => {
    const obj = {
      assumptions: [
        { text: "You should quit.", evidence: "test", why_it_matters: "x", how_to_test: "y" },
      ],
      questions: ["What should you prioritize?"],
    };
    const results = findAdviceInResponse(obj);
    expect(results).toContain("assumptions[0].text");
    // The question should NOT be flagged
    expect(results).not.toContain("questions[0]");
  });

  it("stripAdviceItems removes offending array items", () => {
    const response = {
      assumptions: [
        { text: "Good point", evidence: "e" },
        { text: "You should do X", evidence: "e" },
      ],
      questions: ["What should you think about?"],
    };
    const cleaned = stripAdviceItems(response);
    expect(cleaned.assumptions).toHaveLength(1);
    expect(cleaned.assumptions[0].text).toBe("Good point");
    // Question with "should" in a question mark sentence should remain
    expect(cleaned.questions).toHaveLength(1);
  });
});
