import { Faq } from "@/components/ui/Faq";
import type { FaqCopy } from "./types";
import { Section } from "@/components/ui/Section";

/**
 * T3 row 7: the heading beside the shared FAQ list (ui/Faq). Pages without a software row end on one more
 * paper section, so they pass `band` to keep the paper/band rhythm.
 */
export function SolutionQuestions({
  idPrefix,
  copy,
  ground = "paper",
}: {
  idPrefix: string;
  copy: FaqCopy;
  ground?: "paper" | "band";
}) {
  return (
    <Section ground={ground} labelledBy={`${idPrefix}-faq-title`}>
      <Faq
        items={copy.items}
        intro={
          <h2 id={`${idPrefix}-faq-title`} className="section-title">
            {copy.heading}
          </h2>
        }
      />
    </Section>
  );
}
