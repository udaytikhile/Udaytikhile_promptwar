"use client";

import { useState, useCallback } from "react";

interface ClarifyingQuestionsProps {
  questions: string[];
  originalDecision: string;
  originalReasons: string;
  onResubmit: (decision: string, reasons: string) => void;
  isLoading: boolean;
}

export default function ClarifyingQuestions({
  questions,
  originalDecision,
  originalReasons,
  onResubmit,
  isLoading,
}: ClarifyingQuestionsProps) {
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleResubmit = useCallback(() => {
    const updatedDecision = `${originalDecision}\n\nAdditional details:\n${additionalDetails.trim()}`;
    onResubmit(updatedDecision.slice(0, 1500), originalReasons);
  }, [originalDecision, originalReasons, additionalDetails, onResubmit]);

  return (
    <section aria-labelledby="clarifying-heading" className="card-base bg-amber-50/50 border-amber-300 space-y-4">
      <h2 id="clarifying-heading" className="font-heading text-xl font-semibold text-amber-900">
        A bit more context would help
      </h2>
      <p className="text-zinc-700 text-sm">
        Your description could use a few more specifics to provide deeper reflection. Consider these questions:
      </p>
      <ul className="space-y-2.5 bg-white p-4 rounded-lg border border-amber-200">
        {questions.map((q, i) => (
          <li key={i} className="flex items-start gap-2.5 text-zinc-800 text-[0.9375rem]">
            <span className="text-amber-600 font-bold shrink-0 mt-0.5" aria-hidden="true">?</span>
            <span>{q}</span>
          </li>
        ))}
      </ul>
      <div>
        <label htmlFor="additional-details" className="text-sm font-semibold text-zinc-900 block mb-1.5">
          Add more details
        </label>
        <textarea
          id="additional-details"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          className="input-field min-h-[100px] resize-y"
          placeholder="Add details regarding the questions above to help sharpen the analysis…"
        />
      </div>
      <button
        onClick={handleResubmit}
        disabled={isLoading || !additionalDetails.trim()}
        className="btn-primary"
        aria-busy={isLoading}
      >
        {isLoading ? "Re-analyzing…" : "Re-analyze with details"}
      </button>
    </section>
  );
}
