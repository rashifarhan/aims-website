import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { COMPANY_FIGURES, CUSTOMER_REVIEWS } from "@/lib/site";
import { StarIcon } from "@/components/icons";
import { CountUpFigure } from "@/components/home/CountUpFigure";

/**
 * AIMS in figures (direction 2, paper): the four company figures, marked as stated by AIMS (claims policy), set as one
 * long ticket stub, then AIMS's published reviews, verbatim, left to right as published. The figures count up once
 * (CountUpFigure); the server renders the final numbers.
 */
export async function InsideFigures() {
  const t = await getDictionary();
  const p = t.home.proof;
  return (
    <section id="figures" className="in-paper in-section hf" aria-labelledby="figures-title">
      <div className="hf-top" data-reveal>
        <div>
          <p className="in-eyebrow">{p.label}</p>
          <h2 id="figures-title" className="in-h2">
            {t.home.inside.figuresHeading}
          </h2>
        </div>
        <p className="in-mono hf-note">{p.body}</p>
      </div>
      <ul className="hf-row" data-count-group data-reveal>
        {COMPANY_FIGURES.map(({ key, value, suffix }, order) => (
          <li key={key}>
            <p className="hf-figure">
              <CountUpFigure value={value} suffix={suffix} order={order} />
            </p>
            <p className="in-mono hf-label">{p[key]}</p>
          </li>
        ))}
      </ul>
      <div className="hf-reviews" data-reveal>
        <h3 className="in-mono">{p.reviews}</h3>
        <ul>
          {CUSTOMER_REVIEWS.map((review) => (
            <li key={review.name}>
              <figure lang="en" dir="ltr">
                <p className="hf-stars">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <StarIcon key={i} width="16" height="16" />
                  ))}
                  <span className="sr-only">{fmt(t.home.reviews.rating, { count: review.rating })}</span>
                </p>
                <blockquote>
                  <p>“{review.excerpt}”</p>
                </blockquote>
                <figcaption className="in-mono">
                  {review.name} · {review.place}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
