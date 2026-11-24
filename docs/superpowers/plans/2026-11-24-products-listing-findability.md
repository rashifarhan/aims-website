# Products Listing Findability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A buyer on the products listing always has a next step, through:

- pagination and sort;
- quick picks;
- collapsible facets;
- an always-visible "Can't find your model?" panel;
- zero-results recovery.

**Architecture:**

- **Pure logic** goes in `src/lib/` with Vitest tests: URL state, sort, page slicing, quick-pick presets, filter
  relaxation and the closest-model search.
- **Thin client components** in `src/components/catalogue/` render that logic.
- **State:** everything stays in the URL through the existing `FilterState` (`parseFilters` / `serializeFilters`).
  Page changes push a history entry. All other changes keep using `replaceState`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod 4, MiniSearch 7, Tailwind 4 (tokens only), Vitest,
Playwright + axe. Package manager: pnpm 10.

**Spec:** `docs/superpowers/specs/2026-11-24-products-listing-findability-design.md` (read it first; it holds the
copy, the presets and the reasoning).

## Global Constraints

- **Tokens only.** No raw hex, rgb, px font sizes or shadows in components (CLAUDE.md §2).
- **Shared UI only.** Use the existing button pair (`home-button`, `home-button-outline`, `home-button-sm`), `ui-panel`
  and `ui-link`. Add no new card style.
- **No new motion** beyond the existing hover and press layer (CLAUDE.md §3).
- **Accessibility, WCAG 2.2 AA:**
  - 0 axe violations;
  - 44 × 44 px targets;
  - visible focus;
  - native elements first (`select`, `details`, `a`, `form`);
  - no horizontal scroll at 320 px.
- **Strings:**
  - Every new string goes in `catalogue` in **both** `src/i18n/messages/en.json` and `ar.json`. `Dictionary` is
    `typeof en`, so the keys must match.
  - Model codes render `dir="ltr"`.
  - Flag the Arabic copy for AIMS review in the PR.
- **Contact links** use `ContactLink` (`src/components/contact/ContactLink.tsx`), never a bare `wa.me` or `tel:`
  anchor (risk R5).
- **Claims:** never promise sourcing, stock or a consultation. The wording is fixed by the spec.
- **Existing behaviour stays exact:**
  - the count text `^\d+ products?$`;
  - AT-03 (`?q=sa20` → BioPro SA20 first);
  - AT-04 (`No products match “XYZ-999”.` + `Ask us about “XYZ-999”`);
  - compare `cmp=`.
- **Values:**
  - `PAGE_SIZE = 12`;
  - `page` is omitted from the URL on page 1;
  - `sort` is omitted when `relevance`;
  - sort values are `relevance | name | family`.
- **Before every commit:** `pnpm check` (lint + typecheck + unit tests) passes.

## Review Focus

1. **Bad `page` values.** `?page=99`, `?page=0` or `?page=abc` clamp to a valid page with no crash, and the URL is
   rewritten clean. _(Task 1 tests the parse; Task 4 tests the clamp at render.)_
2. **Filtering on a later page.** Changing a filter, the search or the sort on page 5 lands on page 1 and shows
   results, never an empty page. _(Task 4.)_
3. **Back after paging.** Back returns to the previous page of results, not to the page before the listing.
   _(Task 4 e2e.)_
4. **Arabic and RTL (`/ar/products`).** Previous/Next arrows mirror, model codes stay LTR, and axe is clean.
   _(Task 8.)_
5. **Empty "Can't find" submit.** An empty field never adds a blank quote line, and the browser's `required`
   message shows instead. _(Task 7.)_

---

### Task 1: URL state gains `sort` and `page`; sort and slice helpers

**Files:**

- Modify: `src/lib/filters.ts` (FilterSchema, `serializeFilters`)
- Create: `src/lib/listing.ts`
- Test: `src/lib/filters.test.ts`, `src/lib/listing.test.ts`

**Interfaces:**

- Produces:
  - `type SortKey = "relevance" | "name" | "family"` and `SORT_KEYS` (exported from `filters.ts`).
  - `FilterState` gains `sort: SortKey` (default `"relevance"`) and `page: number` (default `1`, integer ≥ 1;
    invalid input → 1).
  - `serializeFilters` writes `sort` only when it isn't `relevance`, and `page` only when it is above 1. Parameter
    order: `q, family, type, brand, verify, conn, cmp, outdoor, sort, page`.
  - `export const PAGE_SIZE = 12` in `listing.ts`.
  - `sortCards(cards: ProductCard[], sort: SortKey, familyNames: Record<string, string>): ProductCard[]`.
    - `relevance` returns the input unchanged (already search- or default-ordered).
    - `name` uses `localeCompare` on `name`, with `{ numeric: true, sensitivity: "base" }`.
    - `family` sorts by FAMILIES index, then by name.
  - `paginate<T>(items: T[], page: number, size = PAGE_SIZE): { items: T[]; page: number; pageCount: number; from: number; to: number }`.
    - It clamps `page` into `[1, max(1, pageCount)]`.
    - `from` and `to` are 1-based. Both are 0 when `items` is empty.
  - `pageWindow(current: number, count: number): (number | "gap")[]`.
    - It always includes 1, `count`, and current ± 1.
    - Runs of skipped pages become a single `"gap"`.

- [ ] **Step 1: Write failing tests**

```ts
// filters.test.ts
it("parses and serialises sort and page", () => {
  const s = parseFilters({ sort: "name", page: "3" });
  expect([s.sort, s.page]).toEqual(["name", 3]);
  expect(serializeFilters(s)).toBe("?sort=name&page=3");
  expect(parseFilters({ sort: "bogus", page: "abc" })).toMatchObject({ sort: "relevance", page: 1 });
  expect(parseFilters({ page: "0" }).page).toBe(1);
  expect(serializeFilters(parseFilters({ page: "1", sort: "relevance" }))).toBe("");
});

// listing.test.ts
it("paginates 159 items into 14 pages and clamps", () => {
  const items = Array.from({ length: 159 }, (_, i) => i);
  expect(paginate(items, 2)).toMatchObject({ page: 2, pageCount: 14, from: 13, to: 24 });
  expect(paginate(items, 99)).toMatchObject({ page: 14, from: 157, to: 159 });
  expect(paginate([], 3)).toMatchObject({ page: 1, pageCount: 1, from: 0, to: 0, items: [] });
});
it("windows page numbers", () => {
  expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  expect(pageWindow(6, 14)).toEqual([1, "gap", 5, 6, 7, "gap", 14]);
  expect(pageWindow(2, 14)).toEqual([1, 2, 3, "gap", 14]);
});
it("sorts by name (numeric) and by family order", () => {
  // build cards with the card() helper pattern from filters.test.ts
  // name: ["F22","F18","f2"] → ["f2","F18","F22"]
  // family: time-attendance before access-control before door-hardware, then name A–Z
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/filters.test.ts src/lib/listing.test.ts`. Expected: FAIL (`sort` and
      `page` are undefined, and `listing.ts` is missing).
- [ ] **Step 3: Implement the schema fields and the three helpers above.** Use `z.enum(SORT_KEYS).catch("relevance")`
      for `sort`, and a string → int transform that maps anything non-positive or non-integer to 1 for `page`.
- [ ] **Step 4: Run** the same command. Expected: PASS. Then run `pnpm check`. Expected: PASS. Existing filters
      tests still pass, because `activeFilterCount` ignores `sort` and `page`.
- [ ] **Step 5: Commit** `feat(listing): sort and page in the listing URL state`

---

### Task 2: Quick-pick presets

**Files:**

- Create: `src/lib/quickPicks.ts`
- Test: `src/lib/quickPicks.test.ts`

**Interfaces:**

- Consumes: `FilterState`, `applyFilters` (Task 1 / existing).
- Produces:
  - `type QuickPickId = "face" | "fingerprint" | "turnstiles" | "parking" | "panels" | "smart" | "hotel" | "pos"`
  - `QUICK_PICKS: { id: QuickPickId; preset: Partial<Pick<FilterState, "family" | "type" | "verify">> }[]`, in this
    order, with the presets from the spec table:
    - face `{verify:["face"]}`
    - fingerprint `{verify:["fingerprint"]}`
    - turnstiles `{type:["pedestrian"]}`
    - parking `{type:["parking"]}`
    - panels `{type:["panel"]}`
    - smart `{type:["smart"]}`
    - hotel `{type:["hotel"]}`
    - pos `{family:"pos"}`
  - `applyPreset(state: FilterState, preset): FilterState`.
    - Clears `family`, `type`, `brand`, `verify`, `conn` and `outdoor`, then applies the preset.
    - Keeps `q`, `sort` and `cmp`, and sets `page: 1`.
  - `isPresetActive(state: FilterState, preset): boolean`. True when the six filter fields equal exactly what
    `applyPreset` would set.
  - `quickPickCounts(cards: ProductCard[]): Map<QuickPickId, number>`. Counts each preset against the whole
    catalogue, ignoring the current search.

- [ ] **Step 1: Write failing tests:**
  - `applyPreset` keeps `q`, `sort` and `cmp`, and resets `brand` and `page`;
  - `isPresetActive` is true right after `applyPreset` and false once `conn` is added;
  - `quickPickCounts` on a 3-card fixture gives the expected counts, with 0 for absent types.
- [ ] **Step 2: Run** `pnpm vitest run src/lib/quickPicks.test.ts`. Expected: FAIL (the module is missing).
- [ ] **Step 3: Implement** the module.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(listing): quick-pick filter presets`

---

### Task 3: Zero-results helpers (relaxations, closest models)

**Files:**

- Modify: `src/lib/filters.ts`, `src/lib/search.ts`
- Test: `src/lib/filters.test.ts`, `tests/unit/search.test.ts` (create)

**Interfaces:**

- Produces:
  - `type Relaxation = { group: FacetGroup | "outdoor"; value: string; count: number }`
  - `relaxations(cards: ProductCard[], state: FilterState, searchOrder: string[] | null, limit = 2): Relaxation[]`.
    - For each selected option (family, each type/brand/verify/conn value, and outdoor), count the results with
      only that one option removed.
    - Keep counts above 0, sort by count descending, and take `limit`.
    - Return `[]` when there are no filters.
  - `closestSlugs(index: ProductIndex, query: string, limit = 3): string[]`.
    - Search with `combineWith: "OR"`, `fuzzy: (t) => t.length >= 3 ? 0.34 : false` and `prefix: true`.
    - Return `[]` for a blank query.

- [ ] **Step 1: Write failing tests:**
  - `relaxations` on a fixture where `conn=wifi` + `verify=palm` gives 0 results returns the two removals in count
    order, each with the right count;
  - with no filters it returns `[]`;
  - `closestSlugs(createIndex(fixture), "F19")` contains `"f18"`;
  - `closestSlugs(..., "  ")` returns `[]`.
- [ ] **Step 2: Run** `pnpm vitest run src/lib/filters.test.ts tests/unit/search.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** both functions. `relaxations` reuses the existing private `matches` through
      `applyFilters` on a cloned state.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(listing): filter relaxations and closest-model search`

---

### Task 4: Sort control, pagination nav, wiring

**Files:**

- Modify:
  - `src/components/catalogue/useListingState.ts`
  - `src/components/catalogue/useListingModel.ts`
  - `src/components/catalogue/ResultsBar.tsx`
  - `src/components/catalogue/Listing.tsx`
  - `src/i18n/messages/en.json`, `ar.json`
- Create: `src/components/catalogue/Pagination.tsx`
- Test: `tests/e2e/catalogue.spec.ts`

**Interfaces:**

- Consumes: `sortCards`, `paginate`, `pageWindow`, `PAGE_SIZE` (Task 1).
- Produces:
  - `useListingState.update(patch, opts?: { push?: boolean })`.
    - Any patch without `page` sets `page: 1`.
    - `push: true` uses `history.pushState` instead of `replaceState`.
  - `useListingModel` returns `pageResults`, `page`, `pageCount`, `from` and `to`, next to `results`. `results`
    stays the full sorted list, used for the count.
  - `<Pagination page pageCount from to total hrefFor={(n) => string} onGo={(n) => void} labels />` renders
    `nav[aria-label=labels.nav]`:
    - `labels.showing` ("Showing {from}–{to} of {total}");
    - Previous and Next as `<a>`, with `aria-disabled` and no href at the ends;
    - the page links from `pageWindow`, with `aria-current="page"` on the current one;
    - each `"gap"` as a non-interactive `…`;
    - nothing at all when `pageCount <= 1`.
  - A click calls `preventDefault`, then `onGo(n)`, which runs `update({page:n},{push:true})`, scrolls
    `#results-heading` into view and focuses it (`tabIndex={-1}`).

- [ ] **Step 1: Add strings** to `catalogue` (en, and an Arabic equivalent in ar):
  - `"sortLabel": "Sort"`
  - `"sort": { "relevance": "Relevance", "name": "Name A–Z", "family": "Family" }`
  - `"pagination": "Pagination"`
  - `"showing": "Showing {from}–{to} of {total}"`
  - `"prevPage": "Previous"`
  - `"nextPage": "Next"`
  - `"pageN": "Page {n}"` (the aria-label for number links)
- [ ] **Step 2: Write failing e2e tests** in `catalogue.spec.ts`:

```ts
test("pagination: 12 per page, next/back, filter resets to page 1", async ({ page }) => {
  await page.goto("/products", { waitUntil: "load" });
  const cards = page.locator("#main ul > li article");
  await expect(cards).toHaveCount(12);
  const first = await cards.first().locator("h3").innerText();
  await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(cards.first().locator("h3")).not.toHaveText(first);
  await page.goBack();
  await expect(page).not.toHaveURL(/page=/);
  await page.goto("/products?page=3", { waitUntil: "load" });
  await page
    .getByRole("checkbox", { name: /Fingerprint/ })
    .first()
    .check();
  await expect(page).not.toHaveURL(/page=/);
});
test("?page=99 clamps to the last page", async ({ page }) => {
  /* expect "Showing 157–159 of 159" */
});
test("sort by name orders A–Z", async ({ page }) => {
  /* selectOption("name"); first 3 h3 texts are sorted with localeCompare numeric */
});
```

- [ ] **Step 3: Run** `pnpm build && pnpm exec playwright test tests/e2e/catalogue.spec.ts -g "pagination|clamps|sort"`.
      Expected: FAIL.
- [ ] **Step 4: Implement.**
  - **Sort `<select>`:** visible label, 44 px tall, 16 px text. It sits in `ResultsBar`, to the right of the
    count, and always shows. The "Filters (n)" button keeps `lg:hidden`.
  - **Results grid:** render `pageResults` instead of `results`.
  - **`<Pagination>`:** place it after the grid.
  - **Clean URL:** when the URL's `page` is out of range, rewrite it once with `replaceState` to the clamped value.
  - **Previous/Next arrows:** mirror them with `rtl:` utilities.
- [ ] **Step 5: Run** the Step 3 command and the existing `-g "AT-03|AT-04|AT-06"` tests. Expected: all PASS. Then run
      `pnpm check`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(listing): numbered pagination and sort`

---

### Task 5: Quick-picks row on `/products`

**Files:**

- Create: `src/components/catalogue/QuickPicks.tsx`
- Modify:
  - `src/components/catalogue/Listing.tsx`
  - `src/components/catalogue/useListingModel.ts`
  - `en.json`, `ar.json`
- Test: `tests/e2e/catalogue.spec.ts`

**Interfaces:**

- Consumes: `QUICK_PICKS`, `applyPreset`, `isPresetActive`, `quickPickCounts` (Task 2).
- Produces: `<QuickPicks picks={{id,label,count,pressed}[]} label onPick={(id) => void} />`.
  - It renders a labelled group (`role="group"`, `aria-label`) of `<button aria-pressed>` chips.
  - Each chip is styled as the Design Doc chip: a pill, `green-50` / `green-700` border when pressed, with the count
    in `tabular-nums`.
  - The row overflows sideways only inside its own scroller (`overflow-x-auto`), never the page.
  - Picks with a count of 0 are not rendered.
  - The row is rendered only when `family` is undefined.

- [ ] **Step 1: Add strings:**
  - `"quickPicks": "Popular"`
  - `"picks": { "face": "Face recognition", "fingerprint": "Fingerprint", "turnstiles": "Turnstiles & gates", "parking": "Parking barriers", "panels": "Control panels", "smart": "Smart locks", "hotel": "Hotel locks", "pos": "POS terminals" }`
- [ ] **Step 2: Write a failing e2e test.**
  - On `/products`, click "Turnstiles & gates". The URL then matches `type=pedestrian`, the button has
    `aria-pressed="true"`, and the result count equals the chip's count.
  - On `/products/time-attendance`, the group "Popular" is absent.
  - At a 320 px viewport, `document.documentElement.scrollWidth <= 320`.
- [ ] **Step 3: Run it.** Expected: FAIL.
- [ ] **Step 4: Implement.** Place the row between the search field and the rail/results grid.
      `onPick` → `update(applyPreset(state, preset))`.
- [ ] **Step 5: Run** it and `pnpm check`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(listing): quick picks for common needs`

---

### Task 6: Collapsible facet groups

**Files:**

- Modify: `src/components/catalogue/FacetPanel.tsx`, `src/components/catalogue/facetGroups.ts`
- Test: `tests/e2e/catalogue.spec.ts`

**Interfaces:**

- Produces: `FacetGroupView` gains `defaultOpen: boolean`.
  - It is set in `facetGroupViews`: true for `family`, `type` and `verify`, or for any group with a checked option.
  - `FacetPanel` wraps each group in `<details open={defaultOpen}>`. The `<summary>` holds the legend text, with a
    44 px minimum height and a chevron that rotates through the existing hover/press tokens (no new motion
    tokens).
  - The `<fieldset>` and `<legend>` stay inside for semantics. The legend is visually hidden when the summary shows
    the same text.

- [ ] **Step 1: Write a failing e2e test.**
  - On `/products`, the Brand group's checkboxes are hidden and the Family group's are visible.
  - After clicking the "Brand" summary, the ZKTeco checkbox is visible.
  - `/products?brand=alpha` opens Brand by default.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.** Key the `<details>` element by `group.id + defaultOpen`, so it doesn't fight user
      toggles. `open` is only the initial value.
- [ ] **Step 4: Run** it, plus the existing facet tests and `pnpm check`. Expected: PASS. Run axe on `/products`,
      where `summary` must have an accessible name.
- [ ] **Step 5: Commit** `feat(listing): collapsible facet groups`

---

### Task 7: "Can't find your model?" panel + richer empty state

**Files:**

- Create: `src/components/catalogue/CantFindPanel.tsx`
- Modify:
  - `src/components/catalogue/EmptyResults.tsx`
  - `src/components/catalogue/Listing.tsx`
  - `src/components/catalogue/useListingModel.ts`
  - `src/components/catalogue/ListingPage.tsx` (pass hrefs)
  - `en.json`, `ar.json`
- Test: `tests/e2e/catalogue.spec.ts`

**Interfaces:**

- Consumes:
  - `relaxations`, `closestSlugs` (Task 3);
  - `ContactLink`;
  - `CONTACT`, `whatsappUrl` (`src/lib/site.ts`);
  - `dispatchQuote` (`src/lib/quote/useQuote`).
- Produces:
  - `ListingProps.hrefs` gains `solutions: string` and `showroom: string`. `ListingPage` passes
    `href("/solutions")` and `href("/about") + "#showrooms"`.
  - `<CantFindPanel initial={state.q} preset hrefs labels />` renders `<section aria-labelledby>` in a `ui-panel`:
    - an `h2`;
    - the body;
    - a `<form>` holding a labelled `required` input (`maxLength={200}`, 16 px) and a submit button. Submit
      dispatches `{ type: "addCustom", id: \`ask-${Date.now()}\`, text, qty: 1, preset }`;
    - a `role="status"` line with the success text and a link to the quote;
    - the WhatsApp and Call `ContactLink`s;
    - one line with the two tertiary links.
  - `EmptyResults` gains optional props:
    - `closest?: { slug: string; name: string; href: string }[]`, rendered as a list of links under "Closest
      models";
    - `relax?: { label: string; count: number; onRemove: () => void }[]`, rendered as outline buttons reading
      "Remove {label} ({count} products)".

    The existing text and buttons are unchanged.

- [ ] **Step 1: Add strings.** Copy is fixed by the spec:
  - `"cantFindTitle": "Can't find your model?"`
  - `"cantFindBody": "Send us the model code or what you need. AIMS will check availability and reply."`
  - `"cantFindField": "Model or requirement"`
  - `"cantFindSubmit": "Add to quote request"`
  - `"cantFindAdded": "Added to your quote request."`
  - `"cantFindWhatsapp": "Ask on WhatsApp"`
  - `"cantFindWhatsappText": "Hi AIMS, I'm looking for: {text}"`
  - `"cantFindWhatsappGeneric": "Hi AIMS, I'm looking for a product that isn't listed."`
  - `"cantFindCall": "Call the showroom"`
  - `"cantFindSolutions": "Not sure what you need? Compare solutions"`
  - `"cantFindShowroom": "See products at our Deira showroom"`
  - `"closestTitle": "Closest models"`
  - `"relaxRemove": "Remove {label} ({count} products)"`
- [ ] **Step 2: Write failing e2e tests:**
  - `/products`: the "Can't find your model?" heading is visible after the pagination nav. Filling "ZK-9000" and
    submitting gives a quote line `{kind:"custom", text:"ZK-9000"}`, and the status text is visible.
  - Submitting with the field empty adds no line (`quoteLines` length 0).
  - `/products?q=F19` (a near miss): if it returns zero results, "Closest models" lists F18. Otherwise, assert
    against a query that's confirmed to return zero results, chosen while writing the test.
  - `/products?verify=palm&conn=wifi` (or any zero-result pair confirmed against `content/products.json`): a
    "Remove … (n products)" button exists, and clicking it shows n results.
  - AT-04 still passes unchanged.
- [ ] **Step 3: Run them.** Expected: FAIL.
- [ ] **Step 4: Implement.**
  - **Placement:** the panel goes after `<Pagination>` and after `<EmptyResults>`. Prefill it with `state.q`, and
    keep it in sync when `q` changes, unless the user has typed in it.
  - **Relax labels:** reuse `groups` option labels, so they're already localised.
  - **Closest search:** compute closest models only when `results.length === 0 && state.q`.
- [ ] **Step 5: Run** them, plus `-g "AT-03|AT-04|AT-06"` and `pnpm check`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(listing): can't-find panel and zero-results recovery`

---

### Task 8: Decision record and full verification

**Files:**

- Modify: `README.md` → Decisions
- Test: full suites

- [ ] **Step 1: Add a Decisions entry:**

  > **Listing pagination is numbered.** Design Doc ch. 9 specifies "Load more + numbered fallback"; the client
  > asked for paginated results on 24 Nov 2026, so numbered pages are built (12 per page, `?page=` in the URL,
  > real links). Spec: `docs/superpowers/specs/2026-11-24-products-listing-findability-design.md`.

- [ ] **Step 2: Run** `pnpm check`. Expected: PASS.
- [ ] **Step 3: Run** `pnpm build && pnpm e2e`. Expected: all pass, including `smoke.spec.ts` axe (0 violations on
      every route, desktop and mobile) and `catalogue-polish.spec.ts`.
- [ ] **Step 4: Check Arabic and RTL by hand** on `/ar/products?page=2` at 390 px and 1440 px:
  - the arrows are mirrored;
  - model codes are LTR;
  - the chip row scrolls inside its own row;
  - the page has no horizontal scroll at 320 px.
- [ ] **Step 5: Run the design skill checks** on the built `/products`:
  - `copy-lint.mjs --kind tech`;
  - `gate.mjs http://localhost:3000/products`.

  Fix any findings, or waive them with a reason in `.taste-skill/waivers.json`.

- [ ] **Step 6: Commit** `docs: record numbered listing pagination`
