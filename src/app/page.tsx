"use client";

import { useState, useCallback, useRef } from "react";
import type { AnalysisResponse } from "@/lib/schema";
import { SAMPLE_RESULT } from "@/lib/sample-data";
import DecisionForm from "@/components/DecisionForm";
import AnalysisResults from "@/components/AnalysisResults";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ClarifyingQuestions from "@/components/ClarifyingQuestions";
import FollowupSection from "@/components/FollowupSection";
import CopyReflection from "@/components/CopyReflection";

type AppState = "input" | "loading" | "clarify" | "results" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("input");
  const [decision, setDecision] = useState("");
  const [reasons, setReasons] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleAnalyze = useCallback(
    async (dec: string, reas: string) => {
      setDecision(dec);
      setReasons(reas);
      setState("loading");
      setIsSample(false);
      setError("");

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: dec, reasons: reas }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? `Request failed (${res.status})`);
        }

        const data: AnalysisResponse = await res.json();

        if (data.needs_more_info && data.clarifying_questions && data.clarifying_questions.length > 0) {
          setAnalysis(data);
          setState("clarify");
        } else {
          setAnalysis(data);
          setState("results");
        }
        scrollToResults();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setState("error");
        scrollToResults();
      }
    },
    [scrollToResults]
  );

  const handleShowSample = useCallback(() => {
    setAnalysis(SAMPLE_RESULT);
    setIsSample(true);
    setState("results");
    setDecision("");
    setReasons("");
    scrollToResults();
  }, [scrollToResults]);

  const handleStartOver = useCallback(() => {
    setState("input");
    setAnalysis(null);
    setIsSample(false);
    setError("");
  }, []);

  return (
    <>
      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Thinking Companion</span>
            <span aria-hidden="true">•</span>
            <span>Zero Advice</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-zinc-950">
            Blind<span className="text-amber-600">Spot</span>
          </h1>
          <p className="text-zinc-600 text-lg max-w-xl leading-relaxed">
            Describe a decision you&apos;re weighing. This tool reflects your reasoning and reveals
            what you might be missing — without ever telling you what to choose.
          </p>
        </header>

        {/* Input Section */}
        <section aria-labelledby="input-heading" className="card-base bg-white p-6 sm:p-8 mb-10 shadow-sm border-zinc-200">
          <h2 id="input-heading" className="sr-only">
            Describe your decision
          </h2>
          <DecisionForm
            onSubmit={handleAnalyze}
            isLoading={state === "loading"}
            initialDecision={decision}
            initialReasons={reasons}
          />
        </section>

        {/* Results Area */}
        <div ref={resultsRef} aria-live="polite" aria-atomic="false">
          {state === "loading" && <LoadingSkeleton />}

          {state === "error" && (
            <div role="alert" className="card-base border-red-300 bg-red-50/60 p-6 space-y-4">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="shrink-0 text-red-600">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 011 1v4a1 1 0 01-2 0V4a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                {error}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnalyze(decision, reasons)}
                  className="btn-primary text-sm"
                >
                  Try again
                </button>
                <button onClick={handleShowSample} className="btn-secondary text-sm">
                  View sample analysis
                </button>
              </div>
            </div>
          )}

          {state === "clarify" && analysis && (
            <ClarifyingQuestions
              questions={analysis.clarifying_questions ?? []}
              originalDecision={decision}
              originalReasons={reasons}
              onResubmit={handleAnalyze}
              isLoading={false}
            />
          )}

          {state === "results" && analysis && (
            <div className="space-y-10">
              <AnalysisResults data={analysis} isSample={isSample} />

              {/* Follow-up section */}
              {!isSample && analysis.questions.length > 0 && (
                <FollowupSection
                  questions={analysis.questions}
                  decision={decision}
                  reasons={reasons}
                />
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap pt-6 border-t border-zinc-200">
                <CopyReflection
                  decision={decision}
                  reasons={reasons}
                  analysis={analysis}
                />
                <button onClick={handleStartOver} className="btn-secondary">
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-zinc-200 bg-white mt-auto">
        <p className="text-zinc-500 text-sm font-medium">
          Blind Spot helps you think. The decision is always yours.
        </p>
      </footer>
    </>
  );
}
