"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";

type Props = {
  q: string;
  hasFilters: boolean;
  /** The search text already sent to the quote as a request, if any. */
  asked: string;
  quoteHref: string;
  t: Dictionary["catalogue"];
  onClearSearch: () => void;
  onClearFilters: () => void;
  onAsk: () => void;
  /** Models close to a search that found nothing (typos, near codes). */
  closest?: { slug: string; name: string; href: string }[];
  /** Single filter removals that bring products back, with the label of what they remove. */
  relax?: { key: string; label: string; count: number; onRemove: () => void }[];
};

/**
 * Zero results (Design Doc 9 Empty state; AT-04): one sentence, a way back, and for an unknown model
 * "Ask us about …", which adds a free-text line to the quote. Uses the shared button pair (actions.css).
 */
export function EmptyResults({
  q,
  hasFilters,
  asked,
  quoteHref,
  t,
  onClearSearch,
  onClearFilters,
  onAsk,
  closest = [],
  relax = [],
}: Props) {
  return (
    <div className="ui-panel mt-6">
      <p className="text-lg font-semibold text-ink">{q ? fmt(t.noResultsFor, { q }) : t.noResults}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {q && (
          <button type="button" onClick={onClearSearch} className="home-button home-button-outline home-button-sm">
            {t.clearSearch}
          </button>
        )}
        {hasFilters && (
          <button type="button" onClick={onClearFilters} className="home-button home-button-outline home-button-sm">
            {t.clearFilters}
          </button>
        )}
        {relax.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={r.onRemove}
            className="home-button home-button-outline home-button-sm"
          >
            {fmt(t.relaxRemove, { label: r.label, count: r.count })}
          </button>
        ))}
        {q && asked !== q && (
          <button type="button" onClick={onAsk} className="home-button home-button-sm">
            {fmt(t.askAbout, { q })}
          </button>
        )}
      </div>
      {closest.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">{t.closestTitle}</p>
          <ul className="mt-1 flex flex-wrap gap-x-5">
            {closest.map((c) => (
              <li key={c.slug}>
                <Link href={c.href} dir="ltr" className="ui-link inline-flex min-h-11 items-center font-mono">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p role="status" className="mt-3 text-sm text-ink-700">
        {asked && asked === q && (
          <>
            {t.askAdded}{" "}
            <Link href={quoteHref} className="ui-link">
              {t.viewQuote}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
