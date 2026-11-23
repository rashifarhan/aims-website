import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { FaqCopy } from "./types";

/**
 * T3 row 7: questions as native disclosures; answers stay in the DOM for search (Design Doc 9). `close`
 * is the closing band (SolutionCta embedded) as this screen's last block: alone, the band filled a fifth
 * of a desktop screen (taste House rule 3, section-air).
 */
export function SolutionQuestions({ idPrefix, copy, close }: { idPrefix: string; copy: FaqCopy; close?: ReactNode }) {
  return (
    <section className="t3-section t3-questions page-container" aria-labelledby={`${idPrefix}-faq-title`}>
      <h2 id={`${idPrefix}-faq-title`} className="t3-title">
        {copy.heading}
      </h2>
      <div>
        {copy.items.map((item) => (
          <details key={item.q}>
            <summary>
              {item.q}
              <ChevronDownIcon />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      {close}
    </section>
  );
}
