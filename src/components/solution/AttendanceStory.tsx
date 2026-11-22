import { getDictionary } from "@/i18n/dictionaries";
import { AttendanceDrawing } from "./AttendanceDrawing";
import { StoryProgress } from "./StoryProgress";

/** T3 row 2: the "how it works" explainer; the step list is its text equivalent (Design Doc 14). */
export async function AttendanceStory() {
  const { solutionTimeAttendance: t } = await getDictionary();
  const s = t.story;
  return (
    <section className="t3-section page-container" aria-labelledby="ta-story-title">
      <div className="t3-heading">
        <h2 id="ta-story-title" className="t3-title">
          {s.heading}
        </h2>
        <p className="t3-lead">{s.lead}</p>
      </div>
      <StoryProgress steps={s.steps.length} label={s.label}>
        <ol className="story-steps">
          {s.steps.map((step, i) => (
            <li key={step.title} data-story-step={i + 1}>
              <span className="story-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <figure className="story-stage">
          <AttendanceDrawing copy={s} />
          <figcaption>{s.sample}</figcaption>
        </figure>
      </StoryProgress>
    </section>
  );
}
