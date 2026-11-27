"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import type { ProductCard as Card } from "@/content/cards";
import type { FamilySlug } from "@/content/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { countLabel, fmt } from "@/i18n/format";
import {
  MAX_COMPARE,
  SORT_KEYS,
  parseFilters,
  serializeFilters,
  toggle,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { destinationFromSearch, type QuoteContext } from "@/lib/quote/context";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { CompareTray } from "./CompareTray";
import { EmptyResults } from "./EmptyResults";
import { FacetRail } from "./FacetRail";
import { FilterSheet } from "./FilterSheet";
import { ListingSearch } from "./ListingSearch";
import { AppliedFilters } from "./AppliedFilters";
import { CantFindPanel } from "./CantFindPanel";
import { CategoryPicker, type PickerItem } from "./CategoryPicker";
import { SelectionHead } from "./SelectionHead";
import { cardLabels, ResultsGrid } from "./ResultsGrid";
import { useListingModel } from "./useListingModel";
import { Pagination } from "./Pagination";
import { QuickPicks } from "./QuickPicks";
import { ResultsBar } from "./ResultsBar";

export type ListingProps = {
  cards: Card[];
  /** Set on a family listing; the family facet is then hidden. */
  family?: FamilySlug;
  t: Dictionary["catalogue"];
  familyNames: Record<string, string>;
  hrefs: { listing: string; product: string; compare: string; quote: string; solutions: string; showroom: string };
  /** The hub's heading block (breadcrumb, h1, lead), rendered by the server beside the search. */
  intro?: ReactNode;
  /** The hub's category picker. */
  picker?: { label: string; all: { name: string; count: string }; items: PickerItem[] };
  /** A panel beside "Can't find your model?" (the install note). */
  aside?: ReactNode;
};

/** Reads the URL. Rendered inside <Suspense>; the fallback is the unfiltered list. */
export function Listing(props: ListingProps) {
  const params = useSearchParams();
  const urlState = useMemo(() => parseFilters(params), [params]);
  return <ListingView {...props} urlState={urlState} preset={destinationFromSearch(params.toString())} />;
}

const EMPTY = parseFilters({});

/**
 * T4 listing (Design Doc 10): page search, facets with counts, results,
 * compare tray. State is mirrored to the URL, so Back restores it and a
 * link reproduces it (AT-03). Clicks update React state at once and the
 * URL shortly after; the URL wins again when it changes from outside
 * (Back/Forward, the header search).
 */
export function ListingView({
  cards,
  family,
  t,
  familyNames,
  hrefs,
  urlState = EMPTY,
  preset,
  intro,
  picker,
  aside,
}: ListingProps & { urlState?: FilterState; preset?: Partial<QuoteContext> }) {
  const {
    state,
    update,
    effective,
    results,
    picks,
    onPick,
    closest,
    relax,
    pageResults,
    paged,
    onSort,
    onGoToPage,
    hrefForPage,
    groups,
    onToggle,
    typeChips,
    typeTotal,
    onType,
    onFamily,
    filterCount,
    clearFilters,
    compareItems,
    compareHref,
  } = useListingModel({ cards, family, t, familyNames, hrefs, urlState, preset });

  /* ---------- zero state: "Ask us about this model" ---------- */
  const [asked, setAsked] = useState("");

  /* ---------- mobile filter sheet ---------- */
  const sheet = useRef<HTMLDialogElement>(null);

  const typeLabels = t.types as Record<string, string>;
  const subtitle = (c: Card) => (c.types[0] ? typeLabels[c.types[0]] : familyNames[c.family]) ?? "";

  const pickerHas = !family && picker;
  const chosen = effective.family;
  const sel = (
    <SelectionHead
      title={chosen ? (familyNames[chosen] ?? t.allTitle) : t.allTitle}
      link={
        pickerHas && chosen
          ? { href: `${hrefs.listing}/${chosen}`, label: fmt(t.familyPage, { name: familyNames[chosen] ?? "" }) }
          : undefined
      }
      types={{
        label: t.facets.type,
        all: { label: t.allTypes, count: typeTotal, pressed: !state.type.length },
        chips: typeChips,
      }}
      onType={onType}
    >
      {!chosen && <QuickPicks label={t.quickPicks} picks={picks} onPick={onPick} />}
    </SelectionHead>
  );

  return (
    <div className={compareItems.length ? "pb-28" : ""}>
      <div className="lst-head">
        {intro ?? sel}
        <ListingSearch
          value={state.q}
          onChange={(q) => update({ q })}
          label={t.searchLabel}
          placeholder={t.searchPlaceholder}
        />
      </div>

      {pickerHas && (
        <CategoryPicker
          label={picker.label}
          all={picker.all}
          items={picker.items}
          selected={state.family as FamilySlug | undefined}
          onSelect={onFamily}
        />
      )}

      <div className="lst-grid">
        <FacetRail groups={groups} onToggle={onToggle} label={t.filters} trayOpen={compareItems.length > 0} />

        <section aria-labelledby="results-heading" className="lst-results">
          {intro && sel}

          <ResultsBar
            count={results.length}
            countText={countLabel(results.length, t.resultsOne, t.resultsCount)}
            cause={serializeFilters({ ...effective, q: "", cmp: [], page: 1, sort: "relevance" })}
            filtersLabel={filterCount ? fmt(t.filtersCount, { count: filterCount }) : t.filters}
            onOpenFilters={() => sheet.current?.showModal()}
            sort={{
              label: t.sortLabel,
              value: state.sort,
              options: SORT_KEYS.map((k) => ({ value: k, label: t.sort[k] })),
              onChange: (v) => onSort(v as SortKey),
            }}
          />

          {filterCount > 0 && (
            <AppliedFilters
              groups={groups}
              onToggle={onToggle}
              onClear={clearFilters}
              labels={{ clearFilters: t.clearFilters, clearAll: t.clearAll }}
            />
          )}

          {results.length > 0 ? (
            <ResultsGrid
              results={pageResults}
              productHref={hrefs.product}
              preset={preset}
              subtitle={subtitle}
              labels={cardLabels(t)}
              familyLabel={chosen ? undefined : (c) => familyNames[c.family]}
              compare={(c) => ({
                checked: state.cmp.includes(c.slug),
                disabled: !state.cmp.includes(c.slug) && state.cmp.length >= MAX_COMPARE,
                onToggle: () => update({ cmp: toggle(state.cmp, c.slug) }),
              })}
            />
          ) : (
            <EmptyResults
              q={state.q}
              hasFilters={filterCount > 0}
              asked={asked}
              quoteHref={hrefs.quote}
              t={t}
              onClearSearch={() => update({ q: "" })}
              onClearFilters={clearFilters}
              closest={closest}
              relax={relax}
              onAsk={() => {
                dispatchQuote({ type: "addCustom", id: `ask-${Date.now()}`, text: state.q, qty: 1, preset });
                setAsked(state.q);
              }}
            />
          )}

          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            from={paged.from}
            to={paged.to}
            total={results.length}
            hrefFor={hrefForPage}
            onGo={onGoToPage}
            labels={{ nav: t.pagination, showing: t.showing, prev: t.prevPage, next: t.nextPage, pageN: t.pageN }}
          />
        </section>
      </div>

      <div className="lst-helps">
        <CantFindPanel initial={state.q} preset={preset} hrefs={hrefs} t={t} />
        {aside}
      </div>

      <FilterSheet
        sheetRef={sheet}
        groups={groups}
        resultCount={results.length}
        t={t}
        onToggle={onToggle}
        onClear={clearFilters}
      />

      <CompareTray
        items={compareItems.map((c) => ({ slug: c.slug, name: c.name, image: c.image }))}
        compareHref={compareHref}
        max={MAX_COMPARE}
        labels={t}
        onRemove={(slug) => update({ cmp: state.cmp.filter((s) => s !== slug) })}
        onClear={() => update({ cmp: [] })}
      />
    </div>
  );
}
