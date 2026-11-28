"use client";

import type { RefObject } from "react";

type Props = { countText: string; label: string; headingRef: RefObject<HTMLHeadingElement | null> };

/** Mobile: sticky "n items · units · Review quote request" (Design Doc 6, review decision 2). */
export function MobileReviewBar({ countText, label, headingRef }: Props) {
  return (
    <div
      data-bottom-bar
      className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-line bg-paper/96 px-4 py-3 shadow-3 backdrop-blur-md lg:hidden"
    >
      <p className="min-w-0 flex-1 text-sm font-semibold text-ink tabular-nums">{countText}</p>
      <button
        type="button"
        onClick={() => {
          document.getElementById("quote-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
          headingRef.current?.focus({ preventScroll: true });
        }}
        className="home-button home-button-sm shrink-0"
      >
        {label}
      </button>
    </div>
  );
}
