import { getDictionary } from "@/i18n/dictionaries";
import { CUSTOMER_REVIEWS } from "@/lib/site";
import { ReviewTicket } from "@/components/inside/ReviewTicket";

/**
 * AIMS's published reviews as one strip of tickets (inside/ReviewTicket) under a sub-heading. Shared by the night proof on /about (HomeProof)
 * and the home figures band (client decision, 25 Nov 2026). The link out to AIMS's live site was removed at the
 * client's request (25 Nov 2026). With no reviews on file the strip is left out, not shown empty (Harden).
 */
export async function HomeReviews() {
  if (CUSTOMER_REVIEWS.length === 0) return null;
  const t = await getDictionary();
  const { proof, reviews } = t.home;
  return (
    <div className="home-proof-reviews">
      <div className="section-heading">
        <h3 className="home-subtitle">{proof.reviews}</h3>
      </div>
      <ul className="rv-grid">
        {CUSTOMER_REVIEWS.map((review, i) => (
          <li key={review.name}>
            <ReviewTicket review={review} index={i} total={CUSTOMER_REVIEWS.length} labels={reviews} />
          </li>
        ))}
      </ul>
    </div>
  );
}
