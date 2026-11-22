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
};

/**
 * Zero results (Design Doc 9 Empty state; AT-04): one sentence, a way back, and for an unknown model
 * "Ask us about …", which adds a free-text line to the quote. Uses the shared button pair (actions.css).
 */
export function EmptyResults({ q, hasFilters, asked, quoteHref, t, onClearSearch, onClearFilters, onAsk }: Props) {
  return (
    <div className="mt-6 rounded-lg border border-line bg-paper-2 p-6">
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
        {q && asked !== q && (
          <button type="button" onClick={onAsk} className="home-button home-button-sm">
            {fmt(t.askAbout, { q })}
          </button>
        )}
      </div>
      <p role="status" className="mt-3 text-sm text-ink-700">
        {asked && asked === q && (
          <>
            {t.askAdded}{" "}
            <Link href={quoteHref} className="font-semibold text-green-700 underline">
              {t.viewQuote}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
