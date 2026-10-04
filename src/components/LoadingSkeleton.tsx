import { memo } from "react";

export default memo(function LoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading analysis">
      <div className="space-y-3">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-base space-y-3">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">Analyzing your decision…</span>
    </div>
  );
});
