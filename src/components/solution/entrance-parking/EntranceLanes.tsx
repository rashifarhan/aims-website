import { getDictionary } from "@/i18n/dictionaries";
import { LaneDrawing } from "./LaneDrawing";

/**
 * The page's one dealt moment, SIGNAL at a lane (taste motion.md; Design Doc 8): when a third of the
 * section is on screen MomentTrigger sets `data-played` and the card is read, the panels swing open,
 * the plate is read and the boom lifts, once. The numbered steps are the drawing's text equivalent
 * (Design Doc 14), so the drawing never carries information the page doesn't say in words.
 */
export async function EntranceLanes({ idPrefix }: { idPrefix: string }) {
  const { solutionEntranceParking: t } = await getDictionary();
  const c = t.lanes;
  return (
    <section className="t3-section ep-lanes wrap" data-moment aria-labelledby={`${idPrefix}-lanes-title`}>
      <div className="ep-lanes-heading">
        <h2 id={`${idPrefix}-lanes-title`} className="t3-title">
          {c.heading}
        </h2>
        <p className="t3-lead">{c.lead}</p>
      </div>
      {/* Before the steps in the DOM so phones see the drawing as it plays; desktop puts it beside them. */}
      <div className="home-door-stage ep-lanes-stage">
        <LaneDrawing labels={c} />
      </div>
      <ol className="ep-steps" aria-label={c.stepsLabel}>
        {c.steps.map((step, i) => (
          <li key={step.title}>
            <span className="home-door-index tabular-nums" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
