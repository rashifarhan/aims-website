import { Faq } from "@/components/ui/Faq";
import type { FaqCopy } from "./types";

/** T3 row 7: the heading beside the shared FAQ list (ui/Faq). */
export function SolutionQuestions({ idPrefix, copy }: { idPrefix: string; copy: FaqCopy }) {
  return (
    <section className="t3-section wrap" aria-labelledby={`${idPrefix}-faq-title`}>
      <Faq
        items={copy.items}
        intro={
          <h2 id={`${idPrefix}-faq-title`} className="t3-title">
            {copy.heading}
          </h2>
        }
      />
    </section>
  );
}
