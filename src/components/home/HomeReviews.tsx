import { getDictionary } from "@/i18n/dictionaries";
import { CUSTOMER_REVIEWS, LIVE_AIMS } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";
import { ReviewCard } from "./ReviewCard";

/**
 * AIMS's published reviews as one strip of cards under a sub-heading, with the link to read them on AIMS's own site.
 * Shared by the night proof on /about (HomeProof) and the home figures band (client decision, 25 Nov 2026), so the
 * link takes its ground's look. With no reviews on file the strip is left out, not shown empty (Harden).
 */
export async function HomeReviews({ tone }: { tone: "light" | "night" }) {
  if (CUSTOMER_REVIEWS.length === 0) return null;
  const t = await getDictionary();
  const { proof, reviews } = t.home;
  return (
    <div className="home-proof-reviews">
      <div className="section-heading">
        <h3 className="home-subtitle">{proof.reviews}</h3>
        <ExternalLink
          href={LIVE_AIMS.home}
          label={t.common.externalSite}
          className={tone === "night" ? "home-night-link" : "home-secondary"}
        >
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
  );
}
