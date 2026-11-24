import { signalOpacity, signalPaths, type SignalField } from "@/lib/signalPaths";
import "./signal-art.css";

/**
 * A static watermark of the AIMS signal lines (Design Doc 3; client decision, 24 Nov 2026): the home hero's curves,
 * drawn once as inline SVG with no pulses and no motion (CLAUDE.md §3: inner pages and sections gain none). Purely
 * decorative, so aria-hidden; the page's CSS places, fades and mirrors it (signal-art.css). Every fifth line is
 * the strong one, as in the prototype; `minor` marks the others so phones can drop them.
 */
export function SignalArt({
  field,
  gradientId,
  className,
}: {
  field: SignalField;
  gradientId: string;
  className: string;
}) {
  return (
    <svg
      className={`signal-art ${className}`}
      viewBox={`0 0 ${field.width} ${field.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Each line fades in from its start and eases off before it meets the others, so no knot of lines forms. */}
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--color-green-700)" stopOpacity="0" />
          <stop offset=".55" stopColor="var(--color-green-700)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--color-green-700)" stopOpacity=".4" />
        </linearGradient>
      </defs>
      {signalPaths(field).map((d, i) => (
        <path
          key={i}
          d={d}
          className={i % 5 === 0 ? undefined : "signal-art-minor"}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={i % 5 === 0 ? 1.5 : 1}
          vectorEffect="non-scaling-stroke"
          opacity={signalOpacity(i, field.count)}
        />
      ))}
    </svg>
  );
}
