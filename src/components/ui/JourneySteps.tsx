import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { SectionHeader } from "./SectionHeader";

export type JourneyStep = {
  /** A line icon from components/icons.tsx; it is decorative (the title says the step). */
  icon: ReactNode;
  title: string;
  body: string;
  /** Who does the step ("You", "AIMS engineer"): a label, so ink-700, not green (DESIGN.md One Sign Rule). */
  owner?: string;
};

/**
 * The one step-by-step process, "Verified path" (client choice, option C, 25 Nov 2026; replaces mockup C's circles):
 * one card per step, staggered, joined by a dotted lime path that runs behind them from number to number and ends,
 * where `done` is given, in a verified chip. A row where the container fits it and a stacked path where it doesn't
 * (ui/journey.css). An <ol>, so the list gives each step its position; the numerals repeat it visually and are
 * aria-hidden, as are the path and the icons. Static: no motion beyond the pill link's hover layer (CLAUDE.md §3).
 */
export function JourneySteps({
  steps,
  heading,
  ownerLabel,
  done,
  pill,
}: {
  steps: readonly JourneyStep[];
  /** An h2 and lead on the start side; leave it out when the section sets its own heading. */
  heading?: { id: string; title: string; lead?: string };
  /** Read before each owner by screen readers ("Who: AIMS engineer"). */
  ownerLabel?: string;
  /** The outcome the path arrives at ("Working system"), shown as a chip on the last card. */
  done?: string;
  /** The closing line under the steps, with its one link. */
  pill?: { text: string; href: string; label: string };
}) {
  return (
    <div className="journey">
      {heading && <SectionHeader id={heading.id} title={heading.title} lead={heading.lead} />}
      <ol className="journey-list" data-done={done ? "" : undefined}>
        {steps.map((step, i) => (
          <li key={step.title} className="journey-step">
            <div className="journey-card ui-card">
              <div className="journey-head" aria-hidden="true">
                <span className="journey-node tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="journey-icon">{step.icon}</span>
              </div>
              <h3 className="journey-title">{step.title}</h3>
              <p className="journey-body">{step.body}</p>
              {step.owner && (
                <p className="journey-owner">
                  {ownerLabel && <span className="sr-only">{ownerLabel}: </span>}
                  {step.owner}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              // The path to the next number, behind the cards; it stretches to the span, the dots don't.
              <svg className="journey-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 0C50 0 50 100 100 100" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
            {done && i === steps.length - 1 && (
              <p className="journey-done">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 12.5l4 4 8-9" />
                </svg>
                {done}
              </p>
            )}
          </li>
        ))}
      </ol>
      {pill && (
        <div className="journey-pill">
          <p>{pill.text}</p>
          <Link href={pill.href} className="home-text-link">
            {pill.label}
            <ArrowIcon width="16" height="16" className="home-action-arrow" />
          </Link>
        </div>
      )}
    </div>
  );
}
