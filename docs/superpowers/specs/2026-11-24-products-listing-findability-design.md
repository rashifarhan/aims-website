# Products listing: findability and "never stuck" (24 Nov 2026)

Design note for the T4 listing (`/products`, `/products/[family]`). Status: **draft, awaiting client approval.**
Branch: `suggested-changes`.

## Intent

A buyer on the products page should always have a next step: find the model, narrow down to the right one, or
reach AIMS when the model isn't listed. The client's words: "a client should not be stuck anywhere."

The client reviewed NUZON's listing and liked its category shortcuts and its "Can't find a model?" band. NUZON is
a benchmark only (CLAUDE.md). We take the buyer problems it solves, not its layout, copy or look.

## What exists today (read in code, 24 Nov)

- All matching products render in one grid (159 on `/products`). There is no pagination and no sort.
- A 232px facet rail: Family, Type, Brand, Verification, Connectivity, Outdoor, with live counts. Below 1024px it
  becomes a "Filters (n)" sheet. Applied filters show as removable chips. All state lives in the URL
  (`src/lib/filters.ts`).
- MiniSearch over the model code, name and keywords (`src/lib/search.ts`). It allows typos only for terms of 5+
  characters.
- Zero results show "No products match "X"", Clear search, Clear filters, and "Ask us about "X"". That last one adds
  a free-text line to the quote list (AT-04). Nothing helps a buyer whose results are _wrong_ rather than _empty_.
- Compare (up to 3) is already on every card and opens a tray.

## Goals

1. **Pagination.** 12 products per page, numbered, with the page in the URL.
2. **Sort.** Relevance (the default), Name A–Z, and Family.
3. **Quick picks.** One row of shortcuts for common needs, each one a filter preset with a live count.
4. **Collapsible facet groups,** so the rail is shorter and easier to scan.
5. **A "Can't find your model?" panel that always shows** at the end of the results. It offers: add the request to
   the quote list, WhatsApp, call, a link to the solutions guides, and a link to the showroom.
6. **Zero-results recovery:**
   - "Closest models" from a looser search when a search finds nothing.
   - "Remove <filter> (n products)" when filters cause the zero.

## Non-goals

- **A "Help me choose" quiz.** _(Claude's call.)_ The five solution pages already have a choose-your-method
  guide (Master Plan ch. 14, T3), and the T2 finder is P2. The listing links to `/solutions` instead. We can revisit
  this later.
- **A "Has datasheet" filter.** 153 of 159 products have one, so it would filter almost nothing.
- **"Best for" tags on cards.** Design Doc ch. 10 (T4) rules out inferred tags because the data is uneven.
- **Large category cards above the grid.** They push products below the first screen (CLAUDE.md §2: the first
  screen shows products, one main action). The quick-picks row covers the same need in one line.
- **New backend or email sending.** Requests go through the existing quote list, WhatsApp and phone.

## Anti-goals (a failure even if it "works")

- Any claim the site can't back. We don't promise "we source any model". aimsuae.me never says so (checked 24 Nov:
  homepage, /enquiry, /about). The wording is "AIMS will check availability and reply". We also don't promise an
  "engineer consultation", because no free design service is stated.
- Breaking AT-03, AT-04 or AT-06, the shareable URL state, or Back restoring the list.
- Adding clutter on a 390px phone. If mobile feels busy, remove things.

## Constraints

- CLAUDE.md non-negotiables:
  - §1 Truth: product data only from `content/*.json`, company facts only from `src/lib/site.ts`.
  - §2 Design system: tokens only, one button pair, one card style.
  - §3 Motion: no new motion beyond the hover/press layer.
  - §4 Accessibility: WCAG 2.2 AA, 0 axe violations, 44px targets, focus handling.
  - §5 Performance.
  - §6 URLs.
- Master Plan ch. 14 T4: all state in the URL, the count in a live region, the zero state's "Ask about this model".
  ch. 18: AT-03, AT-04, AT-06, AT-08, AT-09, AT-10.
- Design Doc ch. 9:
  - Breadcrumbs, tabs and pagination: "nav aria-label, aria-current".
  - Facet panel: "collapsed, open, applied".
  - Chip: "Button with aria-pressed".
  - Empty state.
- Design Doc ch. 10 T4: "Sort Relevance" sits in the results bar. URL example
  `?verify=fingerprint&sort=relevance`.
- Contact links go through `ContactLink`, so the preview never reaches AIMS's real lines (risk R5).
- Every new string goes in `catalogue` in both `en.json` and `ar.json`. Model codes stay LTR in Arabic.
- Existing e2e tests expect the count text `^\d+ products?$` (`catalogue-polish.spec.ts`), so the count stays
  unchanged. The page range shows in the pagination nav instead.

## Approaches considered

| Approach                                                                                      | Trade-off                                                                                                                                | Verdict    |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **A. Improve the existing listing:** quick-picks row + toolbar sort + pagination + help panel | Builds on the URL state, facets and tests already there. Products stay on the first screen.                                              | **Chosen** |
| B. Category-card hub above the grid (NUZON's structure)                                       | Good for buyers who don't know the problem, but it pushes the grid down about 750px, repeats the Products mega-menu, and looks borrowed. | Rejected   |
| C. Chips only, no sidebar                                                                     | Clean with 2 filter groups. We have 6 groups and 159 products, so chips would wrap into a wall.                                          | Rejected   |

**Pagination style.** Design Doc ch. 9 specifies "Load more + numbered fallback". The client asked for paginated
results, and the client's instruction wins (CLAUDE.md "When sources disagree", rule 1). We build numbered pages,
and the deviation is recorded in `README.md` → Decisions.

## Design

### Toolbar (results bar)

`[159 products] ............ [Sort: Relevance ▾] [Filters (n) — below lg]`

- The count is unchanged: the same live region and text.
- **Sort** is a native `<select>` with a visible label, and writes `sort=`:
  - `relevance`: the default, omitted from the URL. With a search it uses the search order. Without one it uses
    today's `defaultOrder` (cards with a photo and facts first, then by family).
  - `name`: A–Z by display name, locale-aware.
  - `family`: in FAMILIES order, then by name.

### Quick picks (only on `/products`)

One row of chips above the results, under a small "Popular" label. On mobile it scrolls sideways inside its own
row, and the page itself never scrolls sideways.

Each chip is a preset built from existing facet values:

| Chip               | Preset               |
| ------------------ | -------------------- |
| Face recognition   | `verify=face`        |
| Fingerprint        | `verify=fingerprint` |
| Turnstiles & gates | `type=pedestrian`    |
| Parking barriers   | `type=parking`       |
| Control panels     | `type=panel`         |
| Smart locks        | `type=smart`         |
| Hotel locks        | `type=hotel`         |
| POS terminals      | `family=pos`         |

- **Count:** each chip shows its live count against the whole catalogue. A chip with 0 products is hidden.
- **Click:** replaces the current filters with the preset. Search, sort and compare are kept, and the page resets
  to 1.
- **Pressed state:** `aria-pressed` is true when the filters equal that preset exactly.
- **Family pages:** no row there, because the facets are already narrow.

### Facet rail

- Each group is a native `<details>`.
- **Open by default:** Family, Type and Verification, plus any group with a selected option.
- **Closed by default:** Brand, Connectivity and Outdoor.
- The mobile sheet uses the same panel, so it gets the same behaviour.

### Pagination

- `PAGE_SIZE = 12`. The URL param is `page=` (1-based) and is omitted on page 1.
- **Clamping:** out-of-range or invalid values clamp to the nearest valid page.
- **Reset:** any change to filters, search, sort or a quick pick resets to page 1.
- **Layout:** `<nav aria-label="Pagination">` with Previous, page numbers in a window (1 … 4 5 6 … 14) and Next.
  The current page has `aria-current="page"`. Above the links: "Showing 13–24 of 159".
- **Links:** the controls are real `<a href="?…&page=N">`, so they work without JS and crawlers can follow them.
  A click is handled on the client and pushes a history entry, so Back returns to the previous page. Focus then
  moves to the results heading and the view scrolls to the results top.
- **Hidden** when there is only one page.
- **No-JS/crawler fallback:** it renders page 1. Every product is also in the sitemap.

### "Can't find your model?" panel

It sits at the end of the results column, after pagination, on every listing page, including family pages.

- **Heading:** "Can't find your model?"
- **Body:** "Send us the model code or what you need. AIMS will check availability and reply."
- **Field:** "Model or requirement" (a 16px input), prefilled with the current search text.
- **Primary button:** "Add to quote request". It dispatches the existing `addCustom` quote action. Status (role
  status): "Added to your quote request." and a "Review quote request" link.
- **Secondary links:**
  - WhatsApp via `ContactLink`. The message is "Hi AIMS, I'm looking for: {text}", or a generic line when the field
    is empty.
  - Call the showroom via `ContactLink` (`CONTACT.lines.showroom`).
- **Tertiary line:** "Not sure what you need? Compare solutions" → `/solutions`, and "See products at our Deira
  showroom" → `/about#showrooms`.
- **Styling:** one `ui-panel` and the shared button pair, with no new card style.

### Zero-results recovery (inside the existing EmptyResults)

- Keep the existing text and buttons exactly as they are (AT-04).
- **Closest models:** when a search finds nothing and a looser search does find something, list up to 3 product
  links under "Closest models". The looser search uses OR and allows typos from 3 characters.
- **Over-filtering:** when the filters cause the zero, show up to 2 buttons that each remove one selected option,
  e.g. "Remove Wi-Fi (7 products)". They're ranked by how many products they bring back, and only options that
  lead to at least 1 product appear.

## Left to the builder

- The exact Arabic wording. Follow the existing `ar.json` tone and flag it for AIMS review in the PR.
- The pagination window algorithm and the mobile chip-row overflow details, within the a11y rules above.
- Whether `sort` lives in `FilterState` or next to it. `FilterState` is preferred, so serialising stays in one
  place.

## Acceptance

- Unit tests:
  - page slicing and clamping;
  - sort orders;
  - quick-pick presets and counts;
  - relaxation suggestions;
  - the closest-model search;
  - `parseFilters`/`serializeFilters` round-trip with `page` and `sort`.
- E2E, added to `tests/e2e/catalogue.spec.ts`:
  - `?page=2` shows a different 12 products, Next and Previous work, and Back returns to page 1;
  - changing a filter resets to page 1;
  - sort by name gives A–Z order;
  - a quick pick applies its preset and shows `aria-pressed`;
  - "Can't find" adds a custom quote line;
  - an over-filtered state offers a working "Remove …" button.
- AT-03, AT-04 and AT-06 still pass. Axe reports 0 violations at both viewports. The page has no horizontal scroll
  at 320px.
- `pnpm check` passes.
