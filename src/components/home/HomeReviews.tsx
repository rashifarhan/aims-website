import { getDictionary } from "@/i18n/dictionaries";
import { CUSTOMER_REVIEWS, LIVE_AIMS } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";
import { reveal } from "./reveal";

/** T1 row 8: the three real reviews, verbatim, with names as published (Design Doc 10). */
export async function HomeReviews() {
  const t = await getDictionary();
  const { reviews } = t.home;
  return (
    <section className="home-section page-container" aria-labelledby="reviews-title">
      <div className="home-section-heading" {...reveal()}>
        <div>
          <h2 id="reviews-title" className="home-section-title">
            {reviews.heading}
          </h2>
          <p className="home-section-lead">{reviews.source}</p>
        </div>
        <ExternalLink href={LIVE_AIMS.home} label={t.common.externalSite} className="home-text-link">
          {reviews.read}
        </ExternalLink>
      </div>
      <ul className="home-review-grid">
        {CUSTOMER_REVIEWS.map((review, i) => (
          <li key={review.name} {...reveal(i + 1)}>
            <figure className="home-review" lang="en" dir="ltr">
              <span className="home-review-mark" aria-hidden="true">
                “
              </span>
              <blockquote>
                <p>{review.excerpt}</p>
              </blockquote>
              <figcaption>
                <span className="home-review-initial" aria-hidden="true">
                  {review.name.charAt(0)}
                </span>
                {review.name}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
