import { RIDGE_VIEWBOX } from "@/lib/ridgePaths";

/**
 * Faint fingerprint-ridge contours, AIMS's one motif (client decision, 24 Nov 2026): behind the home hero's terminal,
 * on the night bands and on every inner hero. Still, decorative and aria-hidden; ui/ridges.css (loaded once by the root layout) places, masks and colours
 * each use (`className`), so no use takes a layout box or shifts anything.
 */
export function Ridges({ className }: { className: string }) {
  return (
    <svg
      className={`ridges ${className}`}
      viewBox={`0 0 ${RIDGE_VIEWBOX} ${RIDGE_VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
    >
      <use href="#aims-ridges" />
    </svg>
  );
}
