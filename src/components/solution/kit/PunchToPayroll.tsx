import { getDictionary } from "@/i18n/dictionaries";
import { AttendanceDrawing } from "@/components/solution/AttendanceDrawing";

/**
 * Time attendance "how it works" (Master Plan 14; Design Doc 8.3) as the page's dealt moment,
 * `line-carries-colour` (skill moments.md): the section sits on night green after the hero's
 * white, and an accent line climbs through an inset panel of the old ground as it rises. The four
 * steps sit beside the drawing's finished frame, which is their picture and their text equivalent.
 */
export async function PunchToPayroll() {
  const t = await getDictionary();
  const c = t.solutionTimeAttendance.story;
  return (
    <section
      className="section ground-inverse g2m"
      id="how"
      aria-labelledby="how-h"
      data-moment="line-carries-colour"
      data-moment-opts='{"from": "base"}'
    >
      <div className="wrap grid--middle t3-split grid">
        <div className="span-5 stack-5">
          <h2 id="how-h">{c.heading}</h2>
          <ol className="rows process-rows">
            {c.steps.map((step, i) => (
              <li key={step.title}>
                <span className="rows__name">
                  <span className="process-rows__num mono" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step.title}
                </span>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="span-7 start-6">
          <AttendanceDrawing copy={c} />
        </div>
      </div>
    </section>
  );
}
