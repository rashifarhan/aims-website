import { RIDGE_VIEWBOX, ridgePaths } from "@/lib/ridgePaths";

/**
 * The ridge motif's one drawing (client decision, 24 Nov 2026), defined once per page in the root layout so every
 * <Ridges> is a small `<use>` reference instead of another copy of the curves. Hidden and decorative. The strokes
 * keep a hairline width at any size (non-scaling), and take their colour from the referencing SVG.
 */
export function RidgeSymbol() {
  return (
    <svg className="ridge-symbol" width="0" height="0" aria-hidden="true" focusable="false">
      <symbol id="aims-ridges" viewBox={`0 0 ${RIDGE_VIEWBOX} ${RIDGE_VIEWBOX}`}>
        {ridgePaths().map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </symbol>
    </svg>
  );
}
