import { VerifyMark } from "@/components/quote/VerifyMark";
import { getDictionary } from "@/i18n/dictionaries";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Master Plan 12 #5 "process with owners", and the page's one dealt moment, VERIFY (Design Doc 8:
 * signal lines converge into ✓): when a third of the band is on screen, MomentTrigger sets
 * `data-played` and the three inputs of a job (site details, plan and quotation, installation) draw
 * into the handover check, once (signature/verify-moment.css). The mark is decorative; the steps say
 * the same in text. No durations: AIMS publishes none.
 */
export async function ServicesProcess() {
  const { services } = await getDictionary();
  const c = services.process;
  return (
    <section className="t3-section t3-band co-process" data-moment aria-labelledby="services-process-title">
      <div className="wrap">
        <div className="co-process-head">
          <SectionHeader id="services-process-title" title={c.heading} lead={c.lead} />
          <div className="verify-moment co-process-mark">
            <VerifyMark labels={[c.verify[0], c.verify[1], c.verify[2]]} />
          </div>
        </div>
        <ol className="process-list">
          {c.steps.map((step, i) => (
            <li key={step.title}>
              <span className="process-index tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <p className="process-owner">
                <span className="sr-only">{c.owner}: </span>
                {step.owner}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
