"use client";

import { useState } from "react";

type Props = {
  count: number;
  text: string;
  /** Filter state without the search text: the tick answers a filter click, never typing (Emil: no motion on keystrokes). */
  cause: string;
};

/**
 * Result count with the SIGNAL tick (site polish, signature S): when a filter changes the count, the
 * number swaps once and a hairline draws under it from the inline-start edge, then fades. Cards never
 * animate. The live region is the same element as before, so screen readers hear each new count.
 * Reduced motion: catalogue.css removes the animation and the count simply changes.
 */
export function ResultCount({ count, text, cause }: Props) {
  const [last, setLast] = useState({ count, cause, tick: 0 });
  if (count !== last.count || cause !== last.cause) {
    const filterMoved = count !== last.count && cause !== last.cause;
    setLast({ count, cause, tick: filterMoved ? last.tick + 1 : last.tick });
  }
  return (
    <p aria-live="polite" className="text-sm font-medium text-ink-700 tabular-nums">
      {/* Remounting on each tick restarts the CSS sequence; the first render (tick 0) stands still. */}
      <span key={last.tick} className="result-count" data-tick={last.tick > 0 ? "" : undefined}>
        {text}
        <span aria-hidden="true" className="result-count-line" />
      </span>
    </p>
  );
}
