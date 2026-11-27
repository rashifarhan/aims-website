import { getDictionary } from "@/i18n/dictionaries";
import { COMPANY_FIGURES, CUSTOMER_REVIEWS, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { FloodHead } from "@/components/families/FloodHead";
import { FloodSection } from "@/components/families/FloodSection";

/**
 * AIMS in figures, on chalk: the ZKTeco line, the four company figures, flagged as company-stated (CLAUDE.md, Truth), and the three
 * reviews AIMS publishes, quoted verbatim with their five-star rating.
 */
export async function HomeFigures() {
  const t = await getDictionary();
  const p = t.home.proof;
  return (
    <FloodSection id="figures" tone="chalk" labelledBy="figures-title">
      <FloodHead
        id="figures-title"
        kicker={p.label}
        title={p.points.team.title}
        // Claims policy (Design Doc 3.1): the line shows exactly when AIMS has confirmed it (site.ts flag).
        lead={ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
      />
      <dl className="hf-figures">
        {COMPANY_FIGURES.map((f) => (
          <div key={f.key}>
            <dt>{p[f.key]}</dt>
            <dd dir="ltr">
              {f.value.toLocaleString("en")}
              {f.suffix}
            </dd>
          </div>
        ))}
      </dl>
      <p className="hf-note">{p.body}</p>
      <h3 className="hf-reviews-title">{p.reviews}</h3>
      <ul className="hf-reviews">
        {CUSTOMER_REVIEWS.map((r) => (
          <li key={r.name}>
            <p className="hf-stars" role="img" aria-label={t.home.reviews.rating.replace("{count}", String(r.rating))}>
              {"★".repeat(r.rating)}
            </p>
            <blockquote lang="en">{r.excerpt}</blockquote>
            <p className="hf-who">
              <strong lang="en">{r.name}</strong> · <span lang="en">{r.place}</span>
            </p>
          </li>
        ))}
      </ul>
    </FloodSection>
  );
}
