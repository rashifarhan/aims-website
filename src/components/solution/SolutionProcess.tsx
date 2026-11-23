import type { ProcessCopy } from "./types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/** T3 row 5: installation and support process with owners (Plan 14). No durations: AIMS hasn't published any. */
export function SolutionProcess({ idPrefix, copy }: { idPrefix: string; copy: ProcessCopy }) {
  return (
    <Section ground="band" labelledBy={`${idPrefix}-process-title`}>
      {" "}
      <SectionHeader id={`${idPrefix}-process-title`} title={copy.heading} lead={copy.lead} />
      <ol className="process-list">
        {copy.steps.map((step, i) => (
          <li key={step.title}>
            <span className="process-index tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <p className="process-owner">
              <span className="sr-only">{copy.owner}: </span>
              {step.owner}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
