import type { CSSProperties } from "react";
import type { SolutionSlug } from "@/lib/nav";
import { HUB, SITE_POINTS } from "./sitePlan";
import { SitePlanGround } from "./SitePlanGround";

/** The step each line, point and light waits for (site-plan.css); a custom property, not a design value. */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * SIGNAL across a site (Design Doc 3 signal lines, 8): five numbered points, one per solution, joined to
 * one controller node. This markup is the finished frame, which reduced-motion and no-JS visitors see;
 * site-plan.css draws the lines and lights the points once when MomentTrigger sets data-played.
 * Decorative (aria-hidden): the numbered link list beside it says the same in text (Design Doc 14). The
 * plan stays LTR like the door and the reach map (Design Doc 13).
 */
export function SitePlanDrawing({ names }: { names: Record<SolutionSlug, string> }) {
  return (
    <svg className="hs-plan" viewBox="0 0 800 500" aria-hidden="true" focusable="false" direction="ltr">
      <SitePlanGround />
      <g fill="none" className="stroke-green-700" strokeWidth="2" strokeLinecap="round">
        {SITE_POINTS.map((point, i) => (
          <path key={point.slug} d={point.line} pathLength={1} className="hs-line" style={step(i)} />
        ))}
      </g>
      <g transform={`translate(${HUB.x} ${HUB.y})`}>
        <g className="hs-mark">
          <g className="hs-hub">
            <rect x="-15" y="-15" width="30" height="30" rx="7" className="fill-green-700" />
            <rect x="-6" y="-6" width="12" height="12" rx="2" className="fill-paper" />
          </g>
        </g>
      </g>
      {SITE_POINTS.map((point, i) => (
        <g key={point.slug} className="hs-point" data-point={point.slug} style={step(i)}>
          <g transform={`translate(${point.x} ${point.y})`}>
            <g className="hs-mark">
              <circle r="19" className="hs-ring stroke-green-700" fill="none" strokeWidth="2" />
              <circle r="16" className="hs-halo stroke-lime" fill="none" strokeWidth="3" />
              <g className="hs-disc">
                <circle r="13" className="fill-green-700" />
                <text y="0.35em" textAnchor="middle" className="hs-index fill-paper">
                  {String(i + 1).padStart(2, "0")}
                </text>
              </g>
              {/* The live light: lime only here, as a signal on the green disc (DESIGN.md "Lime Is Light"). */}
              <circle cx="10" cy="-10" r="4" className="hs-led fill-lime stroke-paper" strokeWidth="1.5" />
            </g>
          </g>
          <text x={point.label.x} y={point.label.y} textAnchor={point.label.anchor} className="hs-label">
            {names[point.slug]}
          </text>
        </g>
      ))}
    </svg>
  );
}
