"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ProductCard as Card } from "@/content/cards";
import type { FamilySlug } from "@/content/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { countLabel, fmt } from "@/i18n/format";
import {
  MAX_COMPARE,
  activeFilterCount,
  applyFilters,
  parseFilters,
  serializeFilters,
  toggle,
  type FacetGroup,
  type FilterState,
} from "@/lib/filters";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { createIndex, searchSlugs } from "@/lib/search";
import { CompareTray } from "./CompareTray";
import { EmptyResults } from "./EmptyResults";
import { facetGroupViews } from "./facetGroups";
import { FacetRail } from "./FacetRail";
import { FilterSheet } from "./FilterSheet";
import { ListingSearch } from "./ListingSearch";
import { AppliedFilters } from "./AppliedFilters";
import { cardLabels, ResultsGrid } from "./ResultsGrid";
import { useListingState } from "./useListingState";
import { ResultsBar } from "./ResultsBar";

export type ListingProps = {
  cards: Card[];
  /** Set on a family listing; the family facet is then hidden. */
  family?: FamilySlug;
  t: Dictionary["catalogue"];
  familyNames: Record<string, string>;
  hrefs: { product: string; compare: string; quote: string };
};

/** Reads the URL. Rendered inside <Suspense>; the fallback is the unfiltered list. */
export function Listing(props: ListingProps) {
  const params = useSearchParams();
  const urlState = useMemo(() => parseFilters(params), [params]);
  return <ListingView {...props} urlState={urlState} />;
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
}: ListingProps & { urlState?: FilterState }) {
  const { state, update } = useListingState(urlState, family);

  const effective = useMemo<FilterState>(() => (family ? { ...state, family } : state), [state, family]);
  const index = useMemo(() => createIndex(cards, familyNames), [cards, familyNames]);
  const order = useMemo(() => searchSlugs(index, state.q), [index, state.q]);
  const results = useMemo(() => applyFilters(cards, effective, order), [cards, effective, order]);

  /* ---------- facets ---------- */
  const groups = facetGroupViews({ cards, state: effective, searchOrder: order, family, t, familyNames });

  const onToggle = (groupId: string, value: string) => {
    if (groupId === "outdoor") return update({ outdoor: !state.outdoor });
    if (groupId === "family") return update({ family: state.family === value ? undefined : (value as FamilySlug) });
    const key = groupId as Exclude<FacetGroup, "family">;
    update({ [key]: toggle(state[key] as string[], value) } as Partial<FilterState>);
  };

  const filterCount = activeFilterCount(state);
  const clearFilters = () => update({ family: undefined, type: [], brand: [], verify: [], conn: [], outdoor: false });

  /* ---------- compare ---------- */
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);
  const compareItems = state.cmp.map((s) => bySlug.get(s)).filter((c): c is Card => !!c);
  const listingUrl = typeof window === "undefined" ? "" : `${window.location.pathname}${serializeFilters(state)}`;
  const compareHref = `${hrefs.compare}?items=${compareItems.map((c) => c.slug).join(",")}${listingUrl ? `&from=${encodeURIComponent(listingUrl)}` : ""}`;

  /* ---------- zero state: "Ask us about this model" ---------- */
  const [asked, setAsked] = useState("");

  /* ---------- mobile filter sheet ---------- */
  const sheet = useRef<HTMLDialogElement>(null);

  const typeLabels = t.types as Record<string, string>;
  const subtitle = (c: Card) => (c.types[0] ? typeLabels[c.types[0]] : familyNames[c.family]) ?? "";

  return (
    <div className={compareItems.length ? "pb-28" : ""}>
      <ListingSearch
        value={state.q}
        onChange={(q) => update({ q })}
        label={t.searchLabel}
        placeholder={t.searchPlaceholder}
      />

      <div className="mt-8 lg:grid lg:grid-cols-[232px_1fr] lg:gap-10">
        <FacetRail groups={groups} onToggle={onToggle} label={t.filters} trayOpen={compareItems.length > 0} />

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            {t.resultsHeading}
          </h2>

          <ResultsBar
            count={results.length}
            countText={countLabel(results.length, t.resultsOne, t.resultsCount)}
            cause={serializeFilters({ ...effective, q: "", cmp: [] })}
            filtersLabel={filterCount ? fmt(t.filtersCount, { count: filterCount }) : t.filters}
            onOpenFilters={() => sheet.current?.showModal()}
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
              results={results}
              productHref={hrefs.product}
              subtitle={subtitle}
              labels={cardLabels(t)}
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
              onAsk={() => {
                dispatchQuote({ type: "addCustom", id: `ask-${Date.now()}`, text: state.q, qty: 1 });
                setAsked(state.q);
              }}
            />
          )}
        </section>
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
