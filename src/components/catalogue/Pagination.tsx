"use client";

import { ChevronDownIcon } from "@/components/icons";
import { pageWindow } from "@/lib/listing";
import { fmt } from "@/i18n/format";

type Labels = { nav: string; showing: string; prev: string; next: string; pageN: string };

type Props = {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  /** The listing URL for page n, filters kept. Real links, so paging works without JavaScript. */
  hrefFor: (n: number) => string;
  /** A plain click: the listing pushes the history entry itself instead of loading the page. */
  onGo: (n: number) => void;
  labels: Labels;
};

const cell =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-menu tabular-nums transition-colors duration-(--duration-hover)";
const idle = `${cell} border-line text-ink-700 hover:bg-paper-2`;
const here = `${cell} border-green-700 bg-green-50 font-semibold text-green-700`;

/**
 * Numbered pages (design note: 12 a page). Page 1 of 1 shows nothing. Previous and Next are links with a
 * chevron that mirrors in Arabic; at the ends they are muted and hidden from assistive tech (the "Showing" line and
 * the current page already say where the buyer is). A modified click (new tab) is left to the browser.
 */
export function Pagination({ page, pageCount, from, to, total, hrefFor, onGo, labels }: Props) {
  if (pageCount <= 1) return null;

  const go = (n: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onGo(n);
  };

  return (
    <nav aria-label={labels.nav} className="mt-8">
      <p className="text-sm text-ink-700 tabular-nums">{fmt(labels.showing, { from, to, total })}</p>
      <ul className="mt-3 flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <a href={hrefFor(page - 1)} onClick={go(page - 1)} rel="prev" className={`${idle} gap-1`}>
              <ChevronDownIcon width="16" height="16" className="rotate-90 rtl:-rotate-90" />
              {labels.prev}
            </a>
          ) : (
            <span aria-hidden="true" className={`${cell} cursor-not-allowed gap-1 border-line text-ink-600`}>
              <ChevronDownIcon width="16" height="16" className="rotate-90 rtl:-rotate-90" />
              {labels.prev}
            </span>
          )}
        </li>
        {pageWindow(page, pageCount).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-600">
              …
            </li>
          ) : (
            <li key={n}>
              <a
                href={hrefFor(n)}
                onClick={go(n)}
                aria-label={fmt(labels.pageN, { n })}
                aria-current={n === page ? "page" : undefined}
                className={n === page ? here : idle}
              >
                {n}
              </a>
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <a href={hrefFor(page + 1)} onClick={go(page + 1)} rel="next" className={`${idle} gap-1`}>
              {labels.next}
              <ChevronDownIcon width="16" height="16" className="-rotate-90 rtl:rotate-90" />
            </a>
          ) : (
            <span aria-hidden="true" className={`${cell} cursor-not-allowed gap-1 border-line text-ink-600`}>
              {labels.next}
              <ChevronDownIcon width="16" height="16" className="-rotate-90 rtl:rotate-90" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
