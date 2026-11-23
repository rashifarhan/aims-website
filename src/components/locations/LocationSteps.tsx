/** T7 "what AIMS does here" and "delivery & documents" (Design Doc 10.1): three numbered steps on night green. */
export function LocationSteps({ label, steps }: { label: string; steps: readonly { title: string; body: string }[] }) {
  return (
    <ol className="loc-steps" aria-label={label}>
      {steps.map((step, i) => (
        <li key={step.title}>
          <span className="loc-step-index tabular-nums" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
