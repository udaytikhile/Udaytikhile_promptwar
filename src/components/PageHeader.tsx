import { memo } from "react";

export default memo(function PageHeader() {
  return (
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
  );
});
