import type { CSSProperties } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The journey's large step counter in Plex Mono (client request, 25 Nov 2026). Server-rendered at rest: a reel of the
 * step numerals parked on the last one beside the word "steps", so without JS or under reduced motion it reads
 * "05 steps". The pinned timeline (journeyMotion.ts) marks it live, which swaps the word for "/ 05", and rolls the reel
 * to the active step. It repeats what the ordered list says, so it is aria-hidden and never announces on scroll.
 * Shown from 1024px only (home-journey.css).
 */
export function JourneyCounter({ total, label }: { total: number; label: string }) {
  return (
    // --hj-steps parks the reel on its last numeral at rest (home-journey.css).
    <p className="hj-counter" aria-hidden="true" style={{ "--hj-steps": total } as CSSProperties}>
      {/* Numerals read left to right in both languages (Design Doc 13), so "01 / 05" never flips. */}
      <bdi dir="ltr">
        <span className="hj-counter-window">
          <span className="hj-counter-reel">
            {Array.from({ length: total }, (_, i) => (
              <span key={i}>{pad(i + 1)}</span>
            ))}
          </span>
        </span>
        <span className="hj-counter-of"> / {pad(total)}</span>
      </bdi>{" "}
      <span className="hj-counter-word">{label}</span>
    </p>
  );
}
