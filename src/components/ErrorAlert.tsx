import { memo } from "react";

interface ErrorAlertProps {
  error: string;
  onRetry: () => void;
  onShowSample: () => void;
}

export default memo(function ErrorAlert({ error, onRetry, onShowSample }: ErrorAlertProps) {
  return (
    <div role="alert" className="card-base border-red-300 bg-red-50/60 p-6 space-y-4">
      <p className="text-red-800 font-semibold flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          className="shrink-0 text-red-600"
        >
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 011 1v4a1 1 0 01-2 0V4a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        {error}
      </p>
      <div className="flex gap-3">
        <button onClick={onRetry} className="btn-primary text-sm">
          Try again
        </button>
        <button onClick={onShowSample} className="btn-secondary text-sm">
          View sample analysis
        </button>
      </div>
    </div>
  );
});
