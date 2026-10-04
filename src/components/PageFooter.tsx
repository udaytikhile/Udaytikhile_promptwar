import { memo } from "react";

export default memo(function PageFooter() {
  return (
    <footer className="w-full py-8 text-center border-t border-zinc-200 bg-white mt-auto">
      <p className="text-zinc-500 text-sm font-medium">
        Blind Spot helps you think. The decision is always yours.
      </p>
    </footer>
  );
});
