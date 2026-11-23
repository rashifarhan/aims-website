import { getDictionary } from "@/i18n/dictionaries";
import { LockDrawing } from "./LockDrawing";
import { Section } from "@/components/ui/Section";

/**
 * The page's one dealt moment, UNLOCK (Design Doc 8.2; taste motion.md): when a third of the section is
 * on screen MomentTrigger sets `data-played` and the lock opens once (unlock.css). The step list is the
 * drawing's text equivalent (Design Doc 14).
 */
export async function LockUnlock({ idPrefix }: { idPrefix: string }) {
  const { solutionDoorLocks: t } = await getDictionary();
  const c = t.unlock;
  return (
    <Section labelledBy={`${idPrefix}-unlock-title`} className="lk-unlock" moment>
      <div>
        <h2 id={`${idPrefix}-unlock-title`} className="section-title">
          {c.heading}
        </h2>
        <p className="section-lead">{c.lead}</p>
        <ol className="lk-steps" aria-label={c.label}>
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
        <LockDrawing copy={c} />
      </div>
    </Section>
  );
}
