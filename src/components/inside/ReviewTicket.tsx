import { StarIcon } from "@/components/icons";
import { fmt } from "@/i18n/format";
import type { CustomerReview } from "@/lib/site";

export type ReviewTicketLabels = { ticket: string; rating: string; from: string; place: string };

/**
 * One review AIMS published, as a ticket (CLAUDE.md → Design rules, Components: every fact panel is a ticket): the stub
 * with its number and stars, the quote verbatim (site.ts CUSTOMER_REVIEWS, "…" marks a cut), and the reviewer on mono
 * rows below the punched line. The quote, name and place stay English and left-to-right inside Arabic pages, as
 * published. No portrait: AIMS has supplied none, and a stand-in face must never sit beside a real customer's name.
 */
export function ReviewTicket({
  review,
  index,
  total,
  labels,
}: {
  review: CustomerReview;
  index: number;
  total: number;
  labels: ReviewTicketLabels;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <figure className="in-ticket rv">
      <div className="rv-head">
        <span>{fmt(labels.ticket, { n: pad(index + 1), total: pad(total) })}</span>
        <p className="rv-stars">
          {Array.from({ length: review.rating }, (_, i) => (
            <StarIcon key={i} width="15" height="15" aria-hidden="true" />
          ))}
          <span className="sr-only">{fmt(labels.rating, { count: review.rating })}</span>
        </p>
      </div>
      <blockquote className="rv-quote" lang="en" dir="ltr">
        <p>“{review.excerpt}”</p>
      </blockquote>
      <figcaption>
        <dl className="in-ticket-rows">
          <div>
            <dt>{labels.from}</dt>
            <dd lang="en" dir="ltr">
              {review.name}
            </dd>
          </div>
          <div>
            <dt>{labels.place}</dt>
            <dd lang="en" dir="ltr">
              {review.place}
            </dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
