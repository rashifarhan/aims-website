import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { SectionHeader } from "./SectionHeader";

export type JourneyStep = {
  /** A line icon from components/icons.tsx; it is decorative (the title says the step). */
  icon: ReactNode;
  title: string;
  body: string;
  /** Who does the step ("You", "AIMS engineer"): a label, so ink-600, not green (DESIGN.md One Sign Rule). */
  owner?: string;
};

/**
 * The one step-by-step process (client mockup C, "From the first call to a working system"; README Decisions,
 * 24 Nov 2026): numbered circles joined by a green line, a row where the container fits it and a vertical timeline
 * where it doesn't (ui/journey.css). An <ol>, so the list gives each step its position; the badge numerals repeat it
 * visually and are aria-hidden. No motion beyond the pill link's hover and press layer (CLAUDE.md §3).
 */
export function JourneySteps({
  steps,
  heading,
  ownerLabel,
  pill,
}: {
  steps: readonly JourneyStep[];
  /** An h2 and lead on the start side; leave it out when the section sets its own heading. */
  heading?: { id: string; title: string; lead?: string };
  /** Read before each owner by screen readers ("Who: AIMS engineer"). */
  ownerLabel?: string;
  /** The closing line under the steps, with its one link. */
  pill?: { text: string; href: string; label: string };
}) {
  // How many steps share a row decides how wide the container must be before they go across (journey.css).
  const fit = steps.length <= 3 ? "few" : steps.length === 4 ? "four" : "many";
  return (
    <div className="journey">
      {heading && <SectionHeader id={heading.id} title={heading.title} lead={heading.lead} />}
      <ol className="journey-list" data-fit={fit}>
        {steps.map((step, i) => (
          <li key={step.title} className="journey-step">
            <span className="journey-node" aria-hidden="true">
              {step.icon}
              <span className="journey-badge tabular-nums">{i + 1}</span>
            </span>
            <h3 className="journey-title">{step.title}</h3>
            <p className="journey-body">{step.body}</p>
            {step.owner && (
              <p className="journey-owner">
                {ownerLabel && <span className="sr-only">{ownerLabel}: </span>}
                {step.owner}
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
