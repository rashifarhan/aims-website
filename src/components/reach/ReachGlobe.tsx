import type { CSSProperties } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import { initials } from "@/lib/initials";
import { CUSTOMER_REVIEWS } from "@/lib/site";
import { GLOBE_PLACES, REVIEW_PLACE } from "./globePlaces";
import { ReviewGlobe, type GlobeReview } from "./ReviewGlobe";
import "./reach-globe.css";

/**
 * Reach and reviews in one section (owner, 28 Nov 2026), on the POS ground (the proof above it on /about takes access): AIMS's places on a globe that turns
 * to each published review's place. The globe is decorative; the places are listed in text under the heading, and
 * every review is reachable from its own button. Only AIMS's published reviews are shown (CLAUDE.md §1).
 */
export async function ReachGlobe({ titleId }: { titleId: string }) {
  const t = await getDictionary();
  const g = t.globe;
  const reviews: GlobeReview[] = CUSTOMER_REVIEWS.map((r) => ({
    name: r.name,
    place: r.place,
    placeId: REVIEW_PLACE[r.place] ?? "dubai",
    excerpt: r.excerpt,
    rating: r.rating,
    initials: initials(r.name),
  }));

  return (
    <section
      className="rg-section flood"
      aria-labelledby={titleId}
      style={{ "--ground": "var(--color-ground-pos)" } as CSSProperties}
    >
      <div className="wrap rg-wrap">
        <div className="rg-head">
          <p className="rg-kicker">{g.kicker}</p>
          <h2 id={titleId} className="rg-title">
            {g.title}
          </h2>
          <p className="rg-lead">{g.lead}</p>
          <ul className="rg-legend" aria-label={g.places}>
            {GLOBE_PLACES.map((p) => (
              <li key={p.id} data-office={p.office || undefined}>
                <span className="rg-dot" aria-hidden="true" />
                {t.home.reach[p.id]} <span className="rg-legend-kind">· {p.office ? g.office : g.export}</span>
              </li>
            ))}
          </ul>
        </div>
        {reviews.length > 0 && (
          <ReviewGlobe reviews={reviews} labels={{ choose: g.choose, rating: t.home.reviews.rating }} />
        )}
      </div>
    </section>
  );
}
