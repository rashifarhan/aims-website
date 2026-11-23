import { getDictionary } from "@/i18n/dictionaries";
import { CounterDrawing } from "./CounterDrawing";

/**
 * The page's one dealt moment, VERIFY at the counter (Design Doc 8.2; taste motion.md): when a third of
 * the section is on screen MomentTrigger sets `data-played` and the sale runs once (counter.css). The
 * step list is the drawing's text equivalent (Design Doc 14).
 */
export async function CounterVerify({ idPrefix }: { idPrefix: string }) {
  const { solutionPos: t } = await getDictionary();
  const c = t.counter;
  return (
    <section className="t3-section pc-counter wrap" data-moment aria-labelledby={`${idPrefix}-counter-title`}>
      <div>
        <h2 id={`${idPrefix}-counter-title`} className="t3-title">
          {c.heading}
        </h2>
        <p className="t3-lead">{c.lead}</p>
        <ol className="pc-steps" aria-label={c.label}>
          {c.steps.map((step, i) => (
            <li key={step.title}>
              <span className="home-door-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="home-door-stage">
        <CounterDrawing copy={c} />
      </div>
    </section>
  );
}
