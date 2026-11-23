import Image from "next/image";
import type { CustomerReview } from "@/lib/site";
import { StarIcon } from "@/components/icons";
import { fmt } from "@/i18n/format";

/** Up to two initials for the monogram: "Traffic Burger Head Office" → "TB", "Arjun" → "A". */
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * One published review (DESIGN.md card; testimonial anatomy: rating, quote, reviewer). The quote and the
 * reviewer stay English and left-to-right inside Arabic pages, as published. Until AIMS supplies the
 * reviewer's own photo, the avatar is a monogram, never a stand-in face.
 */
export function ReviewCard({ review, ratingLabel }: { review: CustomerReview; ratingLabel: string }) {
  return (
    <figure className="home-review-card ui-card" lang="en" dir="ltr">
      <p className="home-review-stars">
        {Array.from({ length: review.rating }, (_, i) => (
          <StarIcon key={i} width="16" height="16" />
        ))}
        <span className="sr-only">{fmt(ratingLabel, { count: review.rating })}</span>
      </p>
      <blockquote>
        <p>“{review.excerpt}”</p>
      </blockquote>
      <figcaption>
        {review.photo ? (
          <Image
            src={review.photo.src}
            alt=""
            width={review.photo.width}
            height={review.photo.height}
            sizes="44px"
            className="home-review-avatar"
          />
        ) : (
          <span className="home-review-avatar" aria-hidden="true">
            {initials(review.name)}
          </span>
        )}
        <span>
          <span className="home-review-name">{review.name}</span>
          <span className="home-review-place">{review.place}</span>
        </span>
      </figcaption>
    </figure>
  );
}
