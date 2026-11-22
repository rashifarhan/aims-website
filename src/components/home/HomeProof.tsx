import { getDictionary } from "@/i18n/dictionaries";
import { COMPANY_FIGURES, CUSTOMER_REVIEWS, LIVE_AIMS, ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";
import { ReviewCard } from "./ReviewCard";

/**
 * T1 rows 5 and 8 as one section: AIMS's confirmed figures, labelled as company-stated (Design Doc 3.1),
 * then three published reviews as cards (ReviewCard). Each alone was under half a screen, so the
 * taste skill's layout rule merges them (layout-v4: a stat row or quote never stands as a strip).
 */
export async function HomeProof() {
  const t = await getDictionary();
  const { proof, reviews } = t.home;
  return (
    <section className="home-proof-band" aria-labelledby="proof-title">
      <div className="home-section page-container">
        <div className="home-proof">
          <div>
            <h2 id="proof-title" className="home-section-title">
              {ZKTECO_AUTHORIZATION_CONFIRMED ? proof.heading : proof.headingFallback}
            </h2>
            <p className="home-section-lead">{proof.body}</p>
          </div>
          <dl>
            {COMPANY_FIGURES.map(({ key, value, suffix }) => (
              <div key={key}>
                <dt>{proof[key]}</dt>
                <dd className="tabular-nums" dir="ltr">
                  {value.toLocaleString("en")}
                  {suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Harden: the excerpts are AIMS's published reviews; with none on file the block is left out, not shown empty. */}
        {CUSTOMER_REVIEWS.length > 0 && (
          <div className="home-proof-reviews">
            <div className="home-section-heading">
              <h3 className="home-subtitle">{proof.reviews}</h3>
              <ExternalLink href={LIVE_AIMS.home} label={t.common.externalSite} className="home-text-link">
                {reviews.read}
              </ExternalLink>
            </div>
            <ul className="home-review-grid">
              {CUSTOMER_REVIEWS.map((review) => (
                <li key={review.name}>
                  <ReviewCard review={review} ratingLabel={reviews.rating} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
