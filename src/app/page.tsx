"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { AnalysisResponse } from "@/lib/schema";
import { SAMPLE_RESULT } from "@/lib/sample-data";
import DecisionForm from "@/components/DecisionForm";
import AnalysisResults from "@/components/AnalysisResults";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import ErrorAlert from "@/components/ErrorAlert";

// Lazy-load non-critical components to optimize initial bundle and LCP
const ClarifyingQuestions = dynamic(() => import("@/components/ClarifyingQuestions"), { ssr: false });
const FollowupSection = dynamic(() => import("@/components/FollowupSection"), { ssr: false });
const CopyReflection = dynamic(() => import("@/components/CopyReflection"), { ssr: false });

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
        setAnalysis(data);
        setState(data.needs_more_info && data.clarifying_questions && data.clarifying_questions.length > 0 ? "clarify" : "results");
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
        <PageHeader />

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

        <div ref={resultsRef} aria-live="polite" aria-atomic="false">
          {state === "loading" && <LoadingSkeleton />}

          {state === "error" && (
            <ErrorAlert
              error={error}
              onRetry={() => handleAnalyze(decision, reasons)}
              onShowSample={handleShowSample}
            />
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

              {!isSample && analysis.questions.length > 0 && (
                <FollowupSection
                  questions={analysis.questions}
                  decision={decision}
                  reasons={reasons}
                />
              )}

              <div className="flex items-center gap-3 flex-wrap pt-6 border-t border-zinc-200">
                <CopyReflection decision={decision} reasons={reasons} analysis={analysis} />
                <button onClick={handleStartOver} className="btn-secondary">
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </>
  );
}
