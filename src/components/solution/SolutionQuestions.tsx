import { Faq } from "@/components/ui/Faq";
import type { FaqCopy } from "./types";
import { Section } from "@/components/ui/Section";

/** T3 row 7: the heading beside the shared FAQ list (ui/Faq). */
export function SolutionQuestions({ idPrefix, copy }: { idPrefix: string; copy: FaqCopy }) {
  return (
    <Section labelledBy={`${idPrefix}-faq-title`}>
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
