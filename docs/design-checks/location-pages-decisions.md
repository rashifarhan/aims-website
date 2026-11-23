# T7 location-page audit

Client acceptance: **22 November 2026**, “Approve documented T7 exceptions”. The exact T7 exceptions and shared-finding mapping below are accepted under the project gate policy in CLAUDE.md; the native result remains OPEN.

## Raw result and scope

`GATE: OPEN 29 (rounds used up)` on `/zkteco-distributor-in-oman`, the shared export/T7 template. The kit is unchanged. Round 1 reported 33 findings; round 2 reported 28 after genuine defects were corrected. Round 3 reused round 2's unchanged-page measurements and added the generic waiver-cap finding because the project now has nine named waivers (five historical and four T7 entries). The four T7 reasons were recorded, but the raw gate did not accept them or report PASS. The complete output and record are preserved in `location-pages-raw-gate.txt` and `location-pages-gate-record.json`.

The native gate measured the Oman template, not four independently passed pages. All four retained routes and the two additional Arabic export variants receive production Playwright layout, accessibility and navigation checks. Additional visual and performance evidence is recorded below and in the PR. Do not describe the historical Locations hub OPEN29 or its later OFF result as this audit: this is a new run on T7.

## Defects corrected

- Phone hero: the original 873px hero did not fit below the 61px header at 390×844. Reduced spacing and image block size now keep it within the 784px available height. A regression test was red before the change and green afterward.
- Tablet navigation: external labels wrapped to 43.5px at 1024px. Give the search a narrower width until 1280px and retain single-line nav words; the regression now measures ≤24px.
- Hero wrapper now groups its breadcrumbs and hero grid in `.hero-text`, without changing shared content edges.
- Desktop product images remain whole within a 14rem block, keeping the model section's actions inside its content area.
- Removed the full-width rule between support and its final quote action.
- Independent source review found a language-switch bug on `/ar?…` and `/ar#…`. Separate the pathname from its suffix before stripping the locale. The new unit regression was red and then green.

## Four named T7 waiver reasons

These are listed in `.taste-skill/waivers.json` and were explicitly accepted by the client for T7 on 22 November 2026. The hub’s previous approval was not silently extended.

1. `no-visual` on `main#main > section.locations-section.location-support`: this is the required T7 support and FAQ section, with practical ordering checks, not an unillustrated feature promise. No installation or premises photographs have been supplied. A filler picture would not evidence support.
2. `card-layout` on `section#models > div.wrap.page-container > div.location-product-grid`: four real catalogue records use the existing shared card system to compare models and add quantities. Different real photographs and verified specifications distinguish them. The approved T7 design specifies this model selection.
3. `copy-headings` on `ol.location-steps > li:nth-of-type(1) > div > h3`: Destination, Documents, Before dispatch and Models to consider name the export checklist and catalogue section. They are literal, useful nouns/steps, rather than generic brand slogans.
4. `effect-kind` on `section#fulfilment`: the approved domain motion from Design Doc 8.3 draws the actual selected SVG route once. The generic checker expects its own moment module named `true` for a boolean marker. Production tests verify visibility triggering, reduced-motion settling and static content without JavaScript.

## Other open findings (exact targets retained in the raw record)

- Four `phone-number` findings concern the real AIMS public lines in the shared footer. These are brief-given facts in `site.ts`, required by CLAUDE.md and covered by preview contact guards; do not replace them with invented numbers.
- Two `button-styles` findings count the header Quote outline, catalogue Add to quote outline, primary quote action and footer search chips. The approved template reuses the existing controls. The differing header/catalogue outline colours remain a native design finding for explicit review.
- Footer directory: `one-heading`, four `container-edges`, `row-lines`, `split-pair`, `off-grid`, `edge-left`, `edge-right` and its `section-height`. These concern the existing bilingual nav groups, intrinsically wrapping popular searches, contact directory and legal row. Its outer `.page-container` aligns with every page section. The hub reconciliation records the shared directory rationale; the raw selectors for this current DOM remain available here.
- Sticky-header screen reference: `section-height` on the hero, two `one-section`, three `screen-height` findings and `neighbour` at the support/footer boundary. The real first screen contains the header and the remaining hero, and later body sections are 900px at 1440×900. The checker uses an available height of about 827px after subtracting the sticky header. Phone sections grow naturally; the final footer is normal-flow navigation, not an additional marketing section.
- `waivers`: nine project/page entries exceed the kit's global cap of five, even though five existing entries target other pages. No waiver or kit rule was hidden, removed or edited to make this disappear.

The client explicitly accepted the additional T7 targets, existing button variants and combined waiver count after reviewing this report. CLAUDE.md records that narrow extension. Genuine defects remain subject to correction and testing; no raw PASS is claimed.

## Copy, imagery and facts

Kind: product / tech / hardware. Voice: factual trade instructions in British English; Arabic source material checked against AIMS's existing Dubai page, with new translations still a draft. Palette: existing AIMS green actions, white product surfaces and night-green route section. Hero: a whole AIMS SpeedFace cut-out. Moment: approved Dubai route map; no added generic shader or scene. Interactions: existing button, link and card hover/press layer. Every photograph is AIMS's own catalogue asset; no stock stand-ins. Actual premises and installation photographs remain a client-supplied slot for later work, with no invented building image shown now.

The three English copy drafts each report 0 FAIL and 1 `copy-rhythm` WARN. Retained because short export checklists and direct FAQ answers help a trade buyer scan requirements; no filler sentence was added to vary length mechanically. Arabic is checked manually for layout/meaning, not represented as validated by an English copy linter.

No founding year, opening hours, stock, price, delivery-time promise, warranty duration or overseas premises was invented. Company facts come from `src/lib/site.ts`; model facts from the imported catalogue. The canonical URLs and locale pair are preserved, and the preview remains noindex.

## Verification

Production build, lint, typecheck and formatting pass, with 113 unit tests. Full production browser suite: **409 passed, 15 existing viewport exclusions**, including the Arabic export variants and keyboard flow. Isolated throttled mobile performance: **18/18 passed**, three measurements for each of the four retained T7 pages and both homepages. T7 maximum LCP was 1.272s, CLS 0.0058 and transfer 472,445 bytes; every run had zero external requests and page errors. English and Arabic screenshots were visually checked at 390px and 1440px, with additional tablet captures and 320/390/768/1024/1440 reflow assertions. Final CI evidence is attached to PR #5.

## Runtime follow-up

The native measurement above predates the final cold-start prefetch fix; that follow-up changes prefetch policy and test synchronization, with no visual layout changes. CI exposed a genuine location-hub/locale-root segment-prefetch loop that a warm preview had masked. It was reproduced on a fresh server and corrected using the existing scoped guard, guarded breadcrumbs and on-demand language-root navigation. The original `<80` request threshold remains; the expanded 16-case cold-server matrix passed. The exact catalogue button-colour assertion now retries against the live locator during streaming instead of reading a detached node once. No test was skipped or weakened.

## Upstream integration

Main `bfd27ee` (software and the four solution pages) was merged into the feature branch on 23 November 2026 without rewriting history. Both dictionaries retain every value from both branches, and the upstream catalogue test is preserved exactly. An independent integration review found no lost values, routes or guard behaviour. The raw native audit predates this integration and remains an unmodified snapshot, not a fresh integrated PASS; final integrated checks and browser/performance evidence are reported in PR #5.

Final integrated validation on 23 November: **113 unit tests, 409 browser tests passed**, 15 inherited viewport exclusions, no retries; **18/18** isolated performance measurements passed. Maximum T7 LCP1.272s, CLS0.0058, transfer472,445 bytes; all measurements have zero page errors and external requests. Formatting and production build pass.
