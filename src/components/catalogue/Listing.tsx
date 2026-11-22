"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ProductCard as Card } from "@/content/cards";
import { FAMILIES, type FamilySlug } from "@/content/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { countLabel, fmt } from "@/i18n/format";
import {
  MAX_COMPARE,
  activeFilterCount,
  applyFilters,
  facetCounts,
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
import { FacetPanel, type FacetGroupView } from "./FacetPanel";
import { ProductCard } from "./ProductCard";

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
  const typeLabels = t.types as Record<string, string>;
  const groupDefs: { id: FacetGroup; legend: string; label: (v: string) => string; order: string[] }[] = [
    ...(family
      ? []
      : [
          {
            id: "family" as const,
            legend: t.facets.family,
            label: (v: string) => familyNames[v] ?? v,
            order: FAMILIES.map((f) => f.slug),
          },
        ]),
    { id: "type", legend: t.facets.type, label: (v) => typeLabels[v] ?? v, order: Object.keys(t.types) },
    {
      id: "brand",
      legend: t.facets.brand,
      label: (v) => (t.brands as Record<string, string>)[v] ?? v,
      order: ["zkteco", "alpha"],
    },
    {
      id: "verify",
      legend: t.facets.verify,
      label: (v) => (t.verify as Record<string, string>)[v] ?? v,
      order: Object.keys(t.verify),
    },
    {
      id: "conn",
      legend: t.facets.conn,
      label: (v) => (t.conn as Record<string, string>)[v] ?? v,
      order: Object.keys(t.conn),
    },
  ];

  const groups: FacetGroupView[] = groupDefs
    .map((g): FacetGroupView | null => {
      const counts = facetCounts(cards, effective, order, g.id);
      const selected = g.id === "family" ? (effective.family ? [effective.family] : []) : (effective[g.id] as string[]);
      const options = g.order
        .map((value) => ({
          value,
          label: g.label(value),
          count: counts.get(value) ?? 0,
          checked: selected.includes(value),
        }))
        .filter((o) => o.count > 0 || o.checked);
      // A group with a single option filters nothing.
      return options.length > 1 || options.some((o) => o.checked) ? { id: g.id, legend: g.legend, options } : null;
    })
    .filter((g): g is FacetGroupView => g !== null);

  const outdoorCount = applyFilters(cards, { ...effective, outdoor: true }, order).length;
  if (outdoorCount > 0 || effective.outdoor) {
    groups.push({
      id: "outdoor",
      legend: t.facets.outdoor,
      options: [{ value: "1", label: t.facets.outdoor, count: outdoorCount, checked: effective.outdoor }],
    });
  }

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
          className="h-12 w-full rounded-pill border border-line-strong bg-paper ps-12 pe-4 text-base text-ink placeholder:text-ink-400 focus:border-green-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700"
        />
      </form>

      <div className="mt-8 lg:grid lg:grid-cols-[232px_1fr] lg:gap-10">
        {/* Desktop facet rail */}
        <aside aria-label={t.filters} className="hidden lg:block">
          <h2 className="sr-only">{t.filters}</h2>
          <FacetPanel groups={groups} onToggle={onToggle} idPrefix="rail" />
        </aside>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            {t.resultsHeading}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-medium text-ink-700 tabular-nums">
              {countText}
            </p>
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
            <ul className="mt-4 grid border-t border-line sm:grid-cols-2 sm:gap-4 sm:border-0 lg:grid-cols-2 xl:grid-cols-3">
              {results.map((c, i) => (
                <li key={c.slug} className="flex">
                  <div className="w-full">
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
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-lg border border-line bg-paper-2 p-6">
              <p className="text-lg font-semibold text-ink">
                {state.q ? fmt(t.noResultsFor, { q: state.q }) : t.noResults}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {state.q && (
                  <button
                    type="button"
                    onClick={() => update({ q: "" })}
                    className="inline-flex h-11 items-center rounded-pill border border-line-strong bg-paper px-4 text-sm font-semibold"
                  >
                    {t.clearSearch}
                  </button>
                )}
                {filterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-11 items-center rounded-pill border border-line-strong bg-paper px-4 text-sm font-semibold"
                  >
                    {t.clearFilters}
                  </button>
                )}
                {state.q && asked !== state.q && (
                  <button
                    type="button"
                    onClick={() => {
                      dispatchQuote({ type: "addCustom", id: `ask-${Date.now()}`, text: state.q, qty: 1 });
                      setAsked(state.q);
                    }}
                    className="inline-flex h-11 items-center rounded-pill bg-green-700 px-4 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    {fmt(t.askAbout, { q: state.q })}
                  </button>
                )}
              </div>
              <p role="status" className="mt-3 text-sm text-ink-700">
                {asked && asked === state.q && (
                  <>
                    {t.askAdded}{" "}
                    <Link href={hrefs.quote} className="font-semibold text-green-700 underline">
                      {t.viewQuote}
                    </Link>
                  </>
                )}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      <dialog
        ref={sheet}
        aria-label={t.filters}
        onClick={(e) => e.target === sheet.current && sheet.current?.close()}
        className="mt-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-lg bg-paper p-0 text-ink backdrop:bg-ink/40 lg:hidden"
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <h2 className="text-base font-semibold">{t.filters}</h2>
            <button
              type="button"
              onClick={() => sheet.current?.close()}
              aria-label={t.closeFilters}
              className="grid size-11 place-items-center rounded-md"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <FacetPanel groups={groups} onToggle={onToggle} idPrefix="sheet" />
          </div>
          <div className="flex gap-3 border-t border-line p-4">
            <button type="button" onClick={clearFilters} className="h-12 px-4 text-sm font-semibold text-ink-700">
              {t.clearAll}
            </button>
            <button
              type="button"
              onClick={() => sheet.current?.close()}
              className="h-12 flex-1 rounded-pill bg-green-700 font-semibold text-white"
            >
              {fmt(t.showResults, { count: results.length })}
            </button>
          </div>
        </div>
      </dialog>

      <CompareTray
        items={compareItems.map((c) => ({ slug: c.slug, name: c.name }))}
        compareHref={compareHref}
        max={MAX_COMPARE}
        labels={t}
        onRemove={(slug) => update({ cmp: state.cmp.filter((s) => s !== slug) })}
        onClear={() => update({ cmp: [] })}
      />
    </div>
  );
}
