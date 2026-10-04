"use client";

import { useState, useCallback, useRef, type FormEvent } from "react";

const EXAMPLE_DECISION = `I've been offered a 6-month internship starting next month. The stipend is good (₹25,000/month), and the office is only 20 minutes from home. The role is "Operations Associate" — general operations work. I'd be working 40 hours a week. The catch: my college semester is still running, with classes and mid-semester exams coming up in 6 weeks. I'd have to manage both simultaneously.`;

const EXAMPLE_REASONS = `The stipend is attractive for a student. Being close to home saves time and money. I want real industry experience before I graduate — classroom learning feels insufficient.`;

interface DecisionFormProps {
  onSubmit: (decision: string, reasons: string) => void;
  isLoading: boolean;
  initialDecision?: string;
  initialReasons?: string;
}

export default function DecisionForm({ onSubmit, isLoading, initialDecision = "", initialReasons = "" }: DecisionFormProps) {
  const [decision, setDecision] = useState(initialDecision);
  const [reasons, setReasons] = useState(initialReasons);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!decision.trim() || !reasons.trim()) return;
      onSubmit(decision.trim(), reasons.trim());
    },
    [decision, reasons, onSubmit]
  );

  const loadExample = useCallback(() => {
    setDecision(EXAMPLE_DECISION);
    setReasons(EXAMPLE_REASONS);
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="decision-input" className="text-sm font-semibold text-zinc-900">
            Your decision and its details
          </label>
          <span className="text-xs text-zinc-500" aria-live="polite">
            {decision.length}/1500
          </span>
        </div>
        <textarea
          id="decision-input"
          value={decision}
          onChange={(e) => setDecision(e.target.value.slice(0, 1500))}
          className="input-field min-h-[140px] resize-y"
          placeholder="Describe the decision you're facing — options, constraints, timeline, any key numbers..."
          required
          maxLength={1500}
          aria-required="true"
          aria-describedby="decision-hint"
        />
        <p id="decision-hint" className="text-xs text-zinc-500 mt-1.5">
          Include specifics: what are your options, constraints, timeline?
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="reasons-input" className="text-sm font-semibold text-zinc-900">
            What&apos;s driving your thinking?
          </label>
          <span className="text-xs text-zinc-500" aria-live="polite">
            {reasons.length}/600
          </span>
        </div>
        <textarea
          id="reasons-input"
          value={reasons}
          onChange={(e) => setReasons(e.target.value.slice(0, 600))}
          className="input-field min-h-[90px] resize-y"
          placeholder="The main reasons you're leaning a certain way..."
          required
          maxLength={600}
          aria-required="true"
          aria-describedby="reasons-hint"
        />
        <p id="reasons-hint" className="text-xs text-zinc-500 mt-1.5">
          Why are you leaning toward one option? What feels most important?
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={isLoading || !decision.trim() || !reasons.trim()}
          className="btn-primary"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing…
            </span>
          ) : (
            "Find my blind spots"
          )}
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="btn-secondary text-sm"
          aria-label="Load example: student deciding on a 6-month internship"
        >
          Try an example
        </button>
      </div>
    </form>
  );
}
