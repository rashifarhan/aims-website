"use client";

import { ResultCount } from "./ResultCount";

type Props = {
  count: number;
  countText: string;
  /** The filters behind the count; the count's signal tick plays when they change. */
  cause: string;
  filtersLabel: string;
  onOpenFilters: () => void;
  sort: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  };
};

/**
 * The result count, the sort menu, and below 1024px the button that opens the filter sheet
 * (Master Plan 14, T4 mobile; Design Doc 10, T4 "Sort Relevance"). The sort is a native select.
 */
export function ResultsBar({ count, countText, cause, filtersLabel, onOpenFilters, sort }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ResultCount count={count} text={countText} cause={cause} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          {sort.label}
          <select
            value={sort.value}
            onChange={(e) => sort.onChange(e.target.value)}
            className="h-11 rounded-md border border-line-strong bg-paper ps-3 pe-2 text-base text-ink focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700"
          >
            {sort.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onOpenFilters}
          className="home-button home-button-outline home-button-sm lg:hidden"
        >
          {filtersLabel}
        </button>
      </div>
    </div>
  );
}
