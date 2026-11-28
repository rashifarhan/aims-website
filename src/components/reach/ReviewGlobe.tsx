"use client";

import { useState } from "react";
import { StarIcon } from "@/components/icons";
import { fmt } from "@/i18n/format";
import { GlobeCanvas } from "./GlobeCanvas";
import { GLOBE_PLACES, type PlaceId } from "./globePlaces";

export type GlobeReview = {
  name: string;
  place: string;
  placeId: PlaceId;
  excerpt: string;
  rating: number;
  initials: string;
};

type Props = { reviews: GlobeReview[]; labels: { choose: string; rating: string } };

/**
 * AIMS's published reviews beside the reach globe: one button per review, named by its place, shows that review
 * and turns the globe to it. The buttons are native and `aria-pressed`; the card is a polite live region. Reviews
 * stay English and left-to-right inside Arabic pages, as published, and the reviewer is a monogram until AIMS
 * supplies a photo with consent (lib/site.ts CUSTOMER_REVIEWS).
 */
export function ReviewGlobe({ reviews, labels }: Props) {
  const [index, setIndex] = useState(0);
  const review = reviews[index] ?? reviews[0];
  const fallback = GLOBE_PLACES[0];
  if (!review || !fallback) return null;
  const focus = GLOBE_PLACES.find((p) => p.id === review.placeId) ?? fallback;

  return (
    <div className="rg">
      <GlobeCanvas focus={focus} />
      <div className="rg-side">
        <div role="group" aria-label={labels.choose} className="rg-chips">
          {reviews.map((r, i) => (
            <button
              key={r.name}
              type="button"
              className="rg-chip"
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <span className="rg-chip-count" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span lang="en">{r.place}</span>
            </button>
          ))}
        </div>
        <div aria-live="polite" className="rg-slot">
          <figure key={review.name} className="rg-card" lang="en" dir="ltr">
            <p className="rg-stars">
              {Array.from({ length: review.rating }, (_, i) => (
                <StarIcon key={i} width="16" height="16" />
              ))}
              <span className="sr-only">{fmt(labels.rating, { count: review.rating })}</span>
            </p>
            <blockquote className="rg-quote">
              <p>{review.excerpt}</p>
            </blockquote>
            <figcaption className="rg-by">
              <span className="rg-avatar" aria-hidden="true">
                {review.initials}
              </span>
              <span>
                <span className="rg-name">{review.name}</span>
                <span className="rg-place">{review.place}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
