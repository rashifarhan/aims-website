import { getDictionary } from "@/i18n/dictionaries";

/** T3 row 5: installation and support process with owners (Plan 14). No durations: AIMS hasn't published any. */
export async function SolutionProcess() {
  const { solutionTimeAttendance: c } = await getDictionary();
  return (
    <section className="t3-section t3-band" aria-labelledby="ta-process-title">
      <div className="page-container">
        <div className="t3-heading">
          <h2 id="ta-process-title" className="t3-title">
            {c.process.heading}
          </h2>
          <p className="t3-lead">{c.process.lead}</p>
        </div>
        <ol className="process-list">
          {c.process.steps.map((step, i) => (
            <li key={step.title}>
              <span className="process-index tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <p className="process-owner">
                <span className="sr-only">{c.process.owner}: </span>
                {step.owner}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
