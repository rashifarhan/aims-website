import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import type { OptionItem, SectionCopy } from "./types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/** T3 row 3: an option guide ("Choose your method"); each card opens a filtered listing (Plan 14). */
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
    <Section labelledBy={`${idPrefix}-methods-title`}>
      <SectionHeader id={`${idPrefix}-methods-title`} title={copy.heading} lead={copy.lead} />
      <ul className="method-grid">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="method-card">
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
              <p>{item.body}</p>
              <span className="method-count">
                <span className="tabular-nums">{item.count}</span>
                <ArrowIcon width="16" height="16" className="home-action-arrow" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
