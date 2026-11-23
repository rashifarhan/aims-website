import type { ProcessCopy } from "./types";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** T3 row 5: installation and support process with owners (Plan 14). No durations: AIMS hasn't published any. */
export function SolutionProcess({ idPrefix, copy }: { idPrefix: string; copy: ProcessCopy }) {
  return (
    <section className="t3-section t3-band" aria-labelledby={`${idPrefix}-process-title`}>
      <div className="wrap">
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
      </div>
    </section>
  );
}
