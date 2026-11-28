import { getDictionary } from "@/i18n/dictionaries";
import { COMPANY_FIGURES, CUSTOMER_REVIEWS } from "@/lib/site";
import { ReviewTicket } from "@/components/inside/ReviewTicket";
import { CountUpFigure } from "@/components/home/CountUpFigure";

/**
 * AIMS in figures (direction 2, paper): the four company figures, marked as stated by AIMS (claims policy), set as one
 * long ticket stub, then AIMS's published reviews, verbatim, each on a ticket (inside/ReviewTicket). The figures count up once
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
        <ul className="rv-grid">
          {CUSTOMER_REVIEWS.map((review, i) => (
            <li key={review.name}>
              <ReviewTicket review={review} index={i} total={CUSTOMER_REVIEWS.length} labels={t.home.reviews} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
