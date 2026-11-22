type Props = { id: string; heading: string; figures: { value: number; label: string }[] };

/**
 * A statement section for the dealt `counter-rolls` moment (skill moments.md): two to four real
 * figures roll once, like an odometer, when the row comes on screen. Each figure is a count from
 * the catalogue, written in the HTML as its final value, so it stands without script (CLAUDE.md §1).
 */
export function FiguresSection({ id, heading, figures }: Props) {
  return (
    <section className="section" id={id} aria-labelledby={`${id}-h`}>
      <div className="wrap stack-6">
        <h2 id={`${id}-h`}>{heading}</h2>
        <div className="figures grid" data-moment="counter-rolls">
          {figures.map((f) => (
            <div key={f.label} className="span-4">
              {/* The moment hides the digit strips and names the figure (aria-label), which ARIA
                  allows on an image role, not on a plain paragraph. */}
              <p className="t-stat tabular-nums" role="img" aria-label={String(f.value)}>
                {f.value}
              </p>
              <p className="t-small muted">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
