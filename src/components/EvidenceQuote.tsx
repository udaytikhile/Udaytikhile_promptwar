import { memo } from "react";

interface EvidenceQuoteProps {
  text: string;
}

export default memo(function EvidenceQuote({ text }: EvidenceQuoteProps) {
  return (
    <p className="evidence-quote">
      <span className="sr-only">Evidence: </span>
      You wrote: &ldquo;{text}&rdquo;
    </p>
  );
});
