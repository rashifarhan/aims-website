import type { ReactNode } from "react";
import { Faq } from "@/components/ui/Faq";
import type { FaqCopy } from "./types";
import { Section } from "@/components/ui/Section";

/**
 * T3 row 7: the heading beside the shared FAQ list (ui/Faq). Pages without a software row end on one more
 * paper section, so they pass `band` to keep the paper/band rhythm. `close` is the closing panel (ClosePanel
 * embedded) as this screen's last block: alone, the close filled a fifth of a desktop screen (taste House
 * rule 3, section-air; audit T-01).
 */
export function SolutionQuestions({
  idPrefix,
  copy,
  ground = "paper",
  close,
}: {
  idPrefix: string;
  copy: FaqCopy;
  ground?: "paper" | "band";
  close?: ReactNode;
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
      {close}
    </Section>
  );
}
