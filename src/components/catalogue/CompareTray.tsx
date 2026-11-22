"use client";

import Link from "next/link";
import { CloseIcon } from "@/components/icons";
import { fmt } from "@/i18n/format";

type Item = { slug: string; name: string };
type Labels = {
  compareTray: string;
  compareCount: string;
  compareCta: string;
  compareNeedTwo: string;
  compareClear: string;
  compareRemove: string;
  compareMax: string;
};

type Props = {
  items: Item[];
  compareHref: string;
  max: number;
  labels: Labels;
  onRemove: (slug: string) => void;
  onClear: () => void;
};

/**
 * Compare tray (Design Doc 9): appears only when ≥ 1 product is selected;
 * the compare view needs 2–3. It sits above the page, so the listing adds
 * bottom padding while it is shown (WCAG 2.4.11: never hide focus).
 */
export function CompareTray({ items, compareHref, max, labels, onRemove, onClear }: Props) {
  if (!items.length) return null;
  const ready = items.length >= 2;
  return (
    <section
      aria-label={labels.compareTray}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/96 shadow-3 backdrop-blur-md"
    >
      <div className="page-container flex flex-wrap items-center gap-3 py-3">
        <p className="flex-1 text-sm font-semibold text-ink tabular-nums sm:flex-none">
          {fmt(labels.compareCount, { count: items.length })}
        </p>
        <ul className="hidden min-w-0 flex-1 flex-wrap gap-2 sm:flex">
          {items.map((i) => (
            <li
              key={i.slug}
              className="inline-flex h-9 max-w-56 items-center gap-1 rounded-pill border border-line bg-paper-2 ps-3 pe-1 text-sm"
            >
              <span className="truncate">{i.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i.slug)}
                aria-label={fmt(labels.compareRemove, { name: i.name })}
                className="grid size-8 shrink-0 place-items-center rounded-pill text-ink-600 hover:bg-paper-3"
              >
                <CloseIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
        {items.length >= max && (
          <p className="order-last w-full text-xs text-ink-600 sm:order-none sm:w-auto">{labels.compareMax}</p>
        )}
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClear} className="h-11 px-3 text-sm font-medium text-ink-700 hover:text-ink">
            {labels.compareClear}
          </button>
          {ready ? (
            <Link
              href={compareHref}
              className="inline-flex h-11 items-center rounded-pill bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-700"
            >
              {fmt(labels.compareCta, { count: items.length })}
            </Link>
          ) : (
            <p className="max-w-40 text-sm text-ink-600 sm:max-w-none">{labels.compareNeedTwo}</p>
          )}
        </div>
      </div>
    </section>
  );
}
