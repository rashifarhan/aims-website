/** The hero tick's path (src/components/home/HeroTick.tsx), with pathLength so it can stroke in. */
const TICK = "m5 12 4.5 4.5L19 7";

/** Three short lines from the labels' centres (14 %, 50 %, 86 % of the column) into the disc. */
const LINES = ["M0 14C45 14 60 50 100 50", "M0 50H100", "M0 86C45 86 60 50 100 50"];

/**
 * VERIFY on send (README Quote decisions 6; Design Doc 8 "signal lines converge into ✓"): the request's
 * three parts (items, need, reply channel) draw into a green-700 disc, then the tick strokes in and
 * stands. CSS only, once, on mount (quote.css); reduced motion shows the final frame. Decorative: the
 * receipt's heading and text say the same, and the heading keeps focus.
 */
export function VerifyMark({ labels }: { labels: [string, string, string] }) {
  return (
    <div className="verify-mark flex items-stretch gap-2 sm:gap-3" aria-hidden="true">
      <ul className="grid min-w-0 shrink gap-2">
        {labels.map((label, i) => (
          <li
            key={i}
            className="verify-label truncate rounded-pill bg-green-50 px-3 py-1 text-xs font-medium text-green-800 tabular-nums sm:text-sm"
          >
            {label}
          </li>
        ))}
      </ul>
      {/* Sized by its box, not its viewBox: the lines stretch to the labels' height at any width. */}
      <span className="relative min-w-8 grow sm:max-w-40">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full text-green-700 rtl:-scale-x-100"
          fill="none"
        >
          {LINES.map((d) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              className="verify-line"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </span>
      <span className="verify-disc grid size-14 shrink-0 place-items-center self-center rounded-pill bg-green-700 text-paper">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d={TICK} pathLength={1} className="verify-tick" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
