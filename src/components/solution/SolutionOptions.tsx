import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import type { OptionItem, SectionCopy } from "./types";

/**
 * T3 row 3: an option guide ("Choose your method"); each card opens a filtered listing (Plan 14). The card
 * is the shared linked card (resting shadow, lift, press: DESIGN.md Plinth rule) and its icon sits beside
 * the heading, not in a tile above it (impeccable: icon-tile feature cards are the generic shape).
 */
export function SolutionOptions({
  idPrefix,
  copy,
  items,
}: {
  idPrefix: string;
  copy: SectionCopy;
  items: readonly OptionItem[];
}) {
  return (
    <section className="t3-section page-container" aria-labelledby={`${idPrefix}-methods-title`}>
      <div className="t3-heading">
        <h2 id={`${idPrefix}-methods-title`} className="t3-title">
          {copy.heading}
        </h2>
        <p className="t3-lead">{copy.lead}</p>
      </div>
      <ul className="method-grid">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="method-card ui-card ui-card-interactive">
              <div className="method-head">
                <span className="method-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 32 32"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.icon} />
                  </svg>
                </span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.body}</p>
              <span className="method-count">
                <span className="tabular-nums">{item.count}</span>
                <ArrowIcon width="16" height="16" className="home-action-arrow" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
