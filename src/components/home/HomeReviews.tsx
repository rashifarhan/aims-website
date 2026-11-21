import { getDictionary } from "@/i18n/dictionaries";
import { CUSTOMER_REVIEWS, LIVE_AIMS } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";

/** T1 row 8: the three real excerpts, verbatim, set quietly; short proof shouldn't be dressed up. */
export async function HomeReviews() {
  const t = await getDictionary();
  const { reviews } = t.home;
  return (
    <section className="home-section page-container" aria-labelledby="reviews-title">
      <div className="home-section-heading">
        <h2 id="reviews-title" className="home-section-title">
          {reviews.heading}
        </h2>
        <ExternalLink href={LIVE_AIMS.home} label={t.common.externalSite} className="home-text-link">
          {reviews.read}
        </ExternalLink>
      </div>
      <ul className="home-quote-row">
        {CUSTOMER_REVIEWS.map((review) => (
          <li key={review.name}>
            <figure lang="en" dir="ltr">
              <blockquote>
                <p>“{review.excerpt}”</p>
              </blockquote>
              <figcaption>{review.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
