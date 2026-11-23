import { getDictionary } from "@/i18n/dictionaries";
import { AttendanceDrawing } from "./AttendanceDrawing";
import { StoryProgress } from "./StoryProgress";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/** T3 row 2: the "how it works" explainer; the step list is its text equivalent (Design Doc 14). */
export async function AttendanceStory() {
  const { solutionTimeAttendance: t } = await getDictionary();
  const s = t.story;
  return (
    <Section labelledBy="ta-story-title">
      <SectionHeader id="ta-story-title" title={s.heading} lead={s.lead} />
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
    </Section>
  );
}
