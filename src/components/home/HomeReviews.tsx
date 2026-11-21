import { getDictionary } from "@/i18n/dictionaries";
import { CUSTOMER_REVIEWS, LIVE_AIMS } from "@/lib/site";

export async function HomeReviews() {
  const {
    home: { reviews, external },
  } = await getDictionary();
  return (
    <section className="home-section page-container" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="home-section-title">
        {reviews.heading}
      </h2>
      <p className="home-section-lead">{reviews.source}</p>
      <div className="home-three-grid">
        {CUSTOMER_REVIEWS.map((review) => (
          <figure key={review.name} className="home-review" lang="en" dir="ltr">
            <blockquote>
              <p>“{review.excerpt}”</p>
            </blockquote>
            <figcaption>{review.name}</figcaption>
          </figure>
        ))}
      </div>
      <a href={LIVE_AIMS.home} className="home-text-link">
        {reviews.read}
        <span className="home-external-label">{external}</span>
      </a>
    </section>
  );
}
