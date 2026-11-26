import Link from "next/link";

export type BeatCopy = {
  eyebrow: string; // the chapter's topic, e.g. "Parking barriers"
  model: string; // model code, set in mono
  name: string;
  summary: string;
  facts: { label: string; value: string }[];
  href: string;
  hrefLabel: string;
  quoteHref: string;
  quoteLabel: string;
};

/**
 * One product beat's words, laid over the film while that product is framed: everything comes from AIMS's
 * catalogue (content/*.json), nothing is written for the occasion.
 */
export function JourneyBeat({ eyebrow, model, name, summary, facts, href, hrefLabel, quoteHref, quoteLabel }: BeatCopy) {
  return (
    <article className="journey-card">
      <p className="journey-eyebrow">{eyebrow}</p>
      <p className="journey-model" dir="ltr">
        {model}
      </p>
      <h2 className="journey-name">{name}</h2>
      <p className="journey-summary">{summary}</p>
      {facts.length > 0 && (
        <dl className="journey-facts">
          {facts.map((f) => (
            <div key={f.label || f.value}>
              {f.label && <dt>{f.label}</dt>}
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="journey-actions">
        <Link href={href} className="journey-link">
          {hrefLabel}
        </Link>
        <Link href={quoteHref} className="journey-quote">
          {quoteLabel}
        </Link>
      </p>
    </article>
  );
}
