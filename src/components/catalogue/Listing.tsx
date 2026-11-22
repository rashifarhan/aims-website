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
import { CloseIcon, SearchIcon } from "@/components/icons";
import { CompareTray } from "./CompareTray";
import { EmptyResults } from "./EmptyResults";
import { facetGroupViews } from "./facetGroups";
import { FacetPanel } from "./FacetPanel";
import { FilterSheet } from "./FilterSheet";
import { ProductCard } from "./ProductCard";
import { ResultCount } from "./ResultCount";

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
  const [state, setState] = useState(urlState);
  // Follow the URL only when the URL itself changes (Back, header search);
  // our own debounced writes arrive matching the state already.
  const urlKey = serializeFilters(urlState);
  const [lastUrlKey, setLastUrlKey] = useState(urlKey);
  if (urlKey !== lastUrlKey) {
    setLastUrlKey(urlKey);
    if (urlKey !== serializeFilters(state)) setState(urlState);
  }

  const effective = useMemo<FilterState>(() => (family ? { ...state, family } : state), [state, family]);
  const index = useMemo(() => createIndex(cards, familyNames), [cards, familyNames]);
  const order = useMemo(() => searchSlugs(index, state.q), [index, state.q]);
  const results = useMemo(() => applyFilters(cards, effective, order), [cards, effective, order]);

  const urlTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const update = (patch: Partial<FilterState>) => {
    const next = { ...state, ...patch };
    if (family) next.family = undefined; // the route already says which family
    setState(next);
    // Debounced native history update: no server round trip, and typing
    // doesn't flood the history API.
    clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(
      () => window.history.replaceState(null, "", `${window.location.pathname}${serializeFilters(next)}`),
      150,
    );
  };

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

  const cardLabels = {
    add: t.add,
    inQuote: t.inQuote,
    addedAnnounce: t.addedAnnounce,
    qtyAnnounce: t.qtyAnnounce,
    qty: t.qty,
    decrease: t.decrease,
    increase: t.increase,
    compare: t.compare,
    specsOnRequest: t.specsOnRequest,
  };
  const typeLabels = t.types as Record<string, string>;
  const subtitle = (c: Card) => (c.types[0] ? typeLabels[c.types[0]] : familyNames[c.family]) ?? "";
  const countText = countLabel(results.length, t.resultsOne, t.resultsCount);

  return (
    <div className={compareItems.length ? "pb-28" : ""}>
      {/* Page search */}
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-6 max-w-xl">
        <label htmlFor="listing-search" className="sr-only">
          {t.searchLabel}
        </label>
        <SearchIcon className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          id="listing-search"
          type="search"
          value={state.q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder={t.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-pill border border-line-strong bg-paper ps-12 pe-4 text-base text-ink placeholder:text-ink-400 focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700"
        />
      </form>

      <div className="mt-8 lg:grid lg:grid-cols-[232px_1fr] lg:gap-10">
        {/* Desktop facet rail. It stays beside a long grid and scrolls on its own when taller than the screen; it stops
            above the compare tray when one is shown (WCAG 2.4.11). */}
        <aside
          aria-label={t.filters}
          className={`hidden overscroll-contain lg:sticky lg:top-20 lg:-ms-1 lg:block lg:self-start lg:overflow-y-auto lg:py-1 lg:ps-1 lg:pe-2 ${compareItems.length ? "lg:max-h-[calc(100dvh-12rem)]" : "lg:max-h-[calc(100dvh-6.5rem)]"}`}
        >
          <h2 className="sr-only">{t.filters}</h2>
          <FacetPanel groups={groups} onToggle={onToggle} idPrefix="rail" />
        </aside>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            {t.resultsHeading}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ResultCount
              count={results.length}
              text={countText}
              cause={serializeFilters({ ...effective, q: "", cmp: [] })}
            />
            <button
              type="button"
              onClick={() => sheet.current?.showModal()}
              className="inline-flex h-11 items-center rounded-pill border border-line-strong px-4 text-sm font-semibold text-ink lg:hidden"
            >
              {filterCount ? fmt(t.filtersCount, { count: filterCount }) : t.filters}
            </button>
          </div>

          {/* Applied filters as removable chips */}
          {filterCount > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {groups.flatMap((g) =>
                g.options
                  .filter((o) => o.checked)
                  .map((o) => (
                    <li key={`${g.id}-${o.value}`}>
                      <button
                        type="button"
                        onClick={() => onToggle(g.id, o.value)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-green-50 ps-3 pe-2 text-sm font-medium text-green-800 hover:bg-green-100"
                      >
                        {o.label}
                        <CloseIcon width={14} height={14} />
                        <span className="sr-only">({t.clearFilters})</span>
                      </button>
                    </li>
                  )),
              )}
              <li>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 px-2 text-sm font-medium text-ink-700 underline"
                >
                  {t.clearAll}
                </button>
              </li>
            </ul>
          )}

          {results.length > 0 ? (
            <ul className="mt-4 grid border-t border-line sm:grid-cols-2 sm:gap-5 sm:border-0 lg:grid-cols-2 xl:grid-cols-3">
              {results.map((c, i) => (
                <li key={c.slug} className="flex">
                  <ProductCard
                    card={c}
                    href={`${hrefs.product}/${c.slug}`}
                    subtitle={subtitle(c)}
                    labels={cardLabels}
                    eager={i < 4}
                    compare={{
                      checked: state.cmp.includes(c.slug),
                      disabled: !state.cmp.includes(c.slug) && state.cmp.length >= MAX_COMPARE,
                      onToggle: () => update({ cmp: toggle(state.cmp, c.slug) }),
                    }}
                  />
                </li>
              ))}
            </ul>
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
