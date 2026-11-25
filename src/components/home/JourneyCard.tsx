import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { HeroTick } from "./HeroTick";

export type JourneyCardStep = {
  /** A line icon from components/icons.tsx, the same one the step had on JourneySteps; decorative. */
  icon: ReactNode;
  title: string;
  body: string;
  /** Who does the step ("You", "AIMS engineer"): a label, so ink, never green (DESIGN.md One Sign Rule). */
  who: string;
  points: readonly string[];
  link?: { href: string; label: string };
};

/**
 * One step of the home journey timeline (HomeJourney): its rail segment to the next node, its node and its card, the
 * one card look (ui-card: white, radius lg, the plinth shadow). The node is the signature night disc with the lime
 * tick; the GSAP timeline shows the step's numeral until the step is reached, then draws the tick (journeyMotion.ts).
 * The server renders the final frame (segment full, tick drawn), so it stands without JS and under reduced motion.
 * The list position is the <ol>'s, so the numerals are aria-hidden. The last node carries the ring of the closing
 * "verified" pulse.
 */
export function JourneyCard({
  step,
  index,
  last,
  labels,
}: {
  step: JourneyCardStep;
  index: number;
  last: boolean;
  labels: { who: string; includes: string };
}) {
  const number = String(index + 1).padStart(2, "0");
  const includesId = `journey-includes-${index + 1}`;
  return (
    <li className="hj-step">
      {!last && (
        <span className="hj-seg" aria-hidden="true">
          <span className="hj-seg-fill" />
        </span>
      )}
      <span className="hj-node" aria-hidden="true">
        {last && <span className="hj-node-ring" />}
        <span className="hj-node-number">{index + 1}</span>
        <span className="hj-node-tick">
          <HeroTick />
        </span>
      </span>
      <div className="hj-card ui-card">
        <div className="hj-card-head">
          <span className="hj-number" aria-hidden="true">
            {number}
          </span>
          <span className="hj-icon" aria-hidden="true">
            {step.icon}
          </span>
          <p className="hj-who">
            <span className="hj-who-label">
              {labels.who}
              <span className="sr-only">:</span>
            </span>{" "}
            {step.who}
          </p>
        </div>
        <h3 className="hj-title ui-display">{step.title}</h3>
        <p className="hj-body">{step.body}</p>
        <div className="hj-includes">
          <p id={includesId} className="hj-includes-label">
            {labels.includes}
          </p>
          <ul className="hj-points" aria-labelledby={includesId}>
            {step.points.map((point) => (
              <li key={point}>
                <HeroTick />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        {step.link && (
          <Link href={step.link.href} className="home-text-link hj-link">
            {step.link.label}
            <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
          </Link>
        )}
      </div>
    </li>
  );
}
