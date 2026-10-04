import { memo } from "react";
import type { AnalysisResponse } from "@/lib/schema";

/** Category label mapping */
const CATEGORY_LABELS: Record<string, string> = {
  academics: "Academics",
  learning_quality: "Learning Quality",
  long_term: "Long Term",
  finances: "Finances",
  health_wellbeing: "Health & Wellbeing",
  relationships: "Relationships",
  alternatives: "Alternatives",
  reversibility: "Reversibility",
  stakeholders: "Stakeholders",
  upside: "Upside",
  other: "Other",
};

import EvidenceQuote from "./EvidenceQuote";

interface AnalysisResultsProps {
  data: AnalysisResponse;
  isSample?: boolean;
}

export default memo(function AnalysisResults({ data, isSample = false }: AnalysisResultsProps) {
  return (
    <div className="space-y-8">
      {isSample && (
        <div className="card-base border-amber-300 bg-amber-50/70" role="alert">
          <p className="text-sm font-medium text-amber-900 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="text-amber-600 shrink-0">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 011 1v4a1 1 0 01-2 0V4a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            This is a sample analysis. Enter your own decision above for a personalized analysis.
          </p>
        </div>
      )}

      {/* Visible Factors */}
      {data.visible_factors.length > 0 && (
        <section aria-labelledby="visible-factors-heading" className="card-base bg-white">
          <h2 id="visible-factors-heading" className="font-heading text-xl font-semibold mb-3 text-zinc-900">
            What you&apos;re focusing on
          </h2>
          <ul className="space-y-2.5">
            {data.visible_factors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2.5 text-zinc-700 text-[0.9375rem]">
                <span className="text-amber-600 font-bold mt-0.5 shrink-0" aria-hidden="true">●</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Assumptions */}
      {data.assumptions.length > 0 && (
        <section aria-labelledby="assumptions-heading">
          <h2 id="assumptions-heading" className="font-heading text-xl font-semibold mb-3 flex items-center gap-2 text-amber-800">
            <span className="inline-block w-3.5 h-3.5 rounded-sm bg-amber-500 shrink-0" aria-hidden="true" />
            <span>Assumptions</span>
          </h2>
          <div className="grid gap-3.5 md:grid-cols-2">
            {data.assumptions.map((item, i) => (
              <div key={i} className="card-base card-amber">
                <p className="text-zinc-900 font-semibold text-[0.9375rem] leading-snug">{item.text}</p>
                <EvidenceQuote text={item.evidence} />
                <div className="mt-3.5 space-y-2 text-sm">
                  <p className="text-zinc-700">
                    <span className="text-amber-800 font-semibold">Why it matters:</span> {item.why_it_matters}
                  </p>
                  <p className="text-zinc-700">
                    <span className="text-amber-800 font-semibold">How to test:</span> {item.how_to_test}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Overlooked */}
      {data.overlooked.length > 0 && (
        <section aria-labelledby="overlooked-heading">
          <h2 id="overlooked-heading" className="font-heading text-xl font-semibold mb-3 flex items-center gap-2 text-teal-800">
            <span className="inline-block w-3.5 h-3.5 rounded-sm bg-teal-600 shrink-0" aria-hidden="true" />
            <span>Overlooked Factors</span>
          </h2>
          <div className="grid gap-3.5 md:grid-cols-2">
            {data.overlooked.map((item, i) => (
              <div key={i} className="card-base card-teal">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full font-medium">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                </div>
                <p className="text-zinc-900 font-medium text-[0.9375rem]">{item.text}</p>
                <EvidenceQuote text={item.evidence} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Conflicts */}
      {data.conflicts.length > 0 && (
        <section aria-labelledby="conflicts-heading">
          <h2 id="conflicts-heading" className="font-heading text-xl font-semibold mb-3 flex items-center gap-2 text-orange-900">
            <span className="inline-block w-3.5 h-3.5 rounded-sm bg-orange-500 shrink-0" aria-hidden="true" />
            <span>Conflicts in Your Reasoning</span>
          </h2>
          <div className="grid gap-3.5 md:grid-cols-2">
            {data.conflicts.map((item, i) => (
              <div key={i} className="card-base card-coral">
                <p className="text-zinc-900 font-medium text-[0.9375rem]">{item.text}</p>
                <EvidenceQuote text={item.evidence} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Questions */}
      {data.questions.length > 0 && (
        <section aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="font-heading text-xl font-semibold mb-3 flex items-center gap-2 text-purple-900">
            <span className="inline-block w-3.5 h-3.5 rounded-sm bg-purple-600 shrink-0" aria-hidden="true" />
            <span>Questions to Sit With</span>
          </h2>
          <div className="space-y-3">
            {data.questions.map((q, i) => (
              <div key={i} className="card-base card-violet">
                <p className="text-zinc-900 font-medium text-[0.9375rem] leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Safety Note */}
      {data.safety_note && (
        <div className="card-base border-amber-300 bg-amber-50/50" role="note" aria-label="Safety information">
          <p className="text-zinc-700 text-sm">{data.safety_note}</p>
        </div>
      )}
    </div>
  );
});
