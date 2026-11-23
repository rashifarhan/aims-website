"use client";

import { ResultCount } from "./ResultCount";

type Props = {
  count: number;
  countText: string;
  /** The filters behind the count; the count's signal tick plays when they change. */
  cause: string;
  filtersLabel: string;
  onOpenFilters: () => void;
};

/** The result count, and below 1024px the button that opens the filter sheet (Master Plan 14, T4 mobile). */
export function ResultsBar({ count, countText, cause, filtersLabel, onOpenFilters }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ResultCount count={count} text={countText} cause={cause} />
      <button
        type="button"
        onClick={onOpenFilters}
        className="home-button home-button-outline home-button-sm lg:hidden"
      >
        {filtersLabel}
      </button>
    </div>
  );
}
