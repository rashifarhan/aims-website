import type { CSSProperties } from "react";

/**
 * The direction's giant white word (CLAUDE.md → Design rules → Type): decorative, so hidden from assistive tech, and
 * sized by CSS from its measured width in em (`--em`) so it always fits its frame. It is a mark, so it stays
 * left-to-right on Arabic pages.
 */
export function GiantWord({ word, em, className = "" }: { word: string; em: number; className?: string }) {
  return (
    <p className={`giant-word ${className}`} aria-hidden="true" dir="ltr" style={{ "--em": em } as CSSProperties}>
      {word}
    </p>
  );
}
