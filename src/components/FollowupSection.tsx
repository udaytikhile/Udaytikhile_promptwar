"use client";

import { useState, useCallback } from "react";
import type { FollowupResponse } from "@/lib/schema";

interface FollowupSectionProps {
  questions: string[];
  decision: string;
  reasons: string;
}

export default function FollowupSection({ questions, decision, reasons }: FollowupSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FollowupResponse | null>(null);

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;

  const handleSubmit = useCallback(async () => {
    const filledAnswers: Record<string, string> = {};
    for (const [q, a] of Object.entries(answers)) {
      if (a.trim()) filledAnswers[q] = a.trim();
    }
    if (Object.keys(filledAnswers).length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reasons, answers: filledAnswers }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Follow-up analysis failed.");
      }

      const data: FollowupResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [answers, decision, reasons]);

  return (
    <section aria-labelledby="followup-heading" className="space-y-6 pt-6 border-t border-zinc-200">
      <h2 id="followup-heading" className="font-heading text-2xl font-semibold text-zinc-900">
        Reflect on these questions
      </h2>
      <p className="text-zinc-600 text-sm">
        Answer as many as you like, then get a deeper reflection on how your thinking may have shifted.
      </p>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="card-base bg-white">
            <label htmlFor={`followup-q-${i}`} className="text-sm font-semibold text-zinc-900 block mb-2">
              {q}
            </label>
            <textarea
              id={`followup-q-${i}`}
              value={answers[q] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q]: e.target.value.slice(0, 500) }))
              }
              className="input-field min-h-[70px] resize-y text-sm"
              maxLength={500}
              placeholder="Your honest thoughts…"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || answeredCount === 0}
          className="btn-primary"
          aria-busy={isLoading}
        >
          {isLoading ? "Reflecting…" : `Get deeper reflection (${answeredCount} answered)`}
        </button>
      </div>

      {error && (
        <div role="alert" className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 mt-8" aria-live="polite">
          {/* Reasoning Summary */}
          <div className="card-base bg-white border-l-4 border-l-zinc-800">
            <h3 className="font-heading text-lg font-semibold text-zinc-900 mb-2">Your reasoning, reflected back</h3>
            <p className="text-zinc-700 text-[0.9375rem] leading-relaxed">{result.reasoning_summary}</p>
          </div>

          {/* Shifts */}
          {result.shifts.length > 0 && (
            <div className="card-base card-teal">
              <h3 className="font-heading text-lg font-semibold text-teal-800 mb-2">Shifts in your thinking</h3>
              <ul className="space-y-2">
                {result.shifts.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-800 text-sm">
                    <span className="text-teal-600 font-bold mt-0.5 shrink-0" aria-hidden="true">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Remaining */}
          {result.remaining_blind_spots.length > 0 && (
            <div className="card-base card-amber">
              <h3 className="font-heading text-lg font-semibold text-amber-800 mb-2">Still worth considering</h3>
              <ul className="space-y-2">
                {result.remaining_blind_spots.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-800 text-sm">
                    <span className="text-amber-600 font-bold mt-0.5 shrink-0" aria-hidden="true">●</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
