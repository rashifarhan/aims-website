# aims-website

Redesign of [aimsuae.me](https://aimsuae.me) for AIMS Security Systems Trading LLC, a ZKTeco distributor in Dubai.
It is a hiring assignment: build AIMS a better site than its competitor's. The strategy, scope and design live in
[`docs/`](docs/README.md): Master Plan v2.0 and Design Document v0.1, plus the approved animation prototypes. Rules for
working in this repo (for people and for Claude Code) are in [`CLAUDE.md`](CLAUDE.md).

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Script                | What it does                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `pnpm dev`            | Dev server (Turbopack)                                           |
| `pnpm build`          | Production build                                                 |
| `pnpm check`          | Lint + typecheck + unit tests                                    |
| `pnpm test`           | Vitest unit tests (importer, redirects, content, dictionaries)   |
| `pnpm e2e`            | Playwright smoke + axe on desktop and mobile (run `build` first) |
| `pnpm format`         | Prettier (with Tailwind class sorting)                           |
| `pnpm import:content` | Re-import the catalogue from aimsuae.me (see below)              |

Requires Node 22 and pnpm 10.

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4. Design tokens live in `src/app/globals.css` (`@theme`)
- Zod for content schemas
- Fonts self-hosted with `next/font/local`: Inter, IBM Plex Mono, IBM Plex Sans Arabic (OFL)
- Vitest, Playwright, @axe-core/playwright, GitHub Actions

## Structure

```
content/                 imported catalogue (generated, committed)
  products.json          162 products
  software.json          8 software pages
  import-report.json     counts + data issues to raise with AIMS
public/images/           product and software images (webp, ≤1200px)
scripts/import-aims.ts   the importer; scripts/lib/normalise.ts has the pure helpers
src/
  app/[lang]/            every page; the root layout sits under [lang]
  app/global-not-found.tsx
  content/               schema.ts, taxonomy.ts, catalogue.ts (typed accessors)
  i18n/                  locales, dictionaries, en.json / ar.json
  lib/routes.ts          route registry: the 35 designed routes + status
  lib/redirects.ts       301 map from old aimsuae.me URLs
  proxy.ts               locale routing
tests/e2e/               Playwright
```

## Decisions

**URLs.** English has no prefix, so every existing aimsuae.me product, software and location URL keeps its address
and its ranking. Arabic is served under `/ar`. `src/proxy.ts` rewrites `/x` to `/en/x` internally and sends `/en/x`
to `/x` with a 308.

**i18n.** I used Next's built-in pattern (`app/[lang]` + `next/root-params` + JSON dictionaries) instead of next-intl.
It needs no extra dependency and works with Cache Components. `ar.json` must have exactly the keys of `en.json`, and a
unit test enforces it.

**Redirects.** Every entry in `src/lib/redirects.ts` returns **301**, as AT-13 requires (Next's default would be 308).
Unit tests check that the map has no duplicates and no chains, and that every destination resolves to a route the site
serves.

**Indexing is off by default.** Every deployment sends `X-Robots-Tag: noindex`, a robots meta tag and
`Disallow: /`. Set `SITE_INDEXABLE=true` on the production deployment only, at launch. See `.env.example`.

**404.** Because the root layout sits under a dynamic `[lang]` segment, unmatched URLs use `global-not-found.tsx`
(the Next docs recommend this for that case).

**Route registry.** `src/lib/routes.ts` lists the 35 designed routes, each with a `status`. A route moves to `"built"`
in the commit that adds its page. From then on the e2e suite requires it to return 200, have one `h1`, allow zoom,
and pass axe with zero violations.

### Catalogue decisions (after the design review)

1. **All 159 live products get a page** from the T5 template. The plan had 6 pages plus links back to aimsuae.me; with
   the full catalogue imported, that link-out would undercut the demo. The six plan products are the hand-reviewed
   ones in `src/lib/routes.ts`.
2. **Card facts are two verbatim spec rows chosen per family** (`src/content/facts.ts`), never inferred. Products
   without structured specs say "Specs on request".
3. **Compare is its own page** (`/products/compare?items=…&from=…`), so Back returns to the same results. On phones
   rows stack (label above values) with no sideways scroll; missing values read "Not listed by AIMS"; ~18 trade
   terms get a plain-language hint (`src/content/glossary.ts`). "3000 Templates" and "3,000" don't count as a
   difference.
4. **"Often fitted with"** appears only when a product's own spec sheet lists a lock and exit button under "Access
   control interface".
5. **Listing state** lives in React and is mirrored to the URL with debounced `history.replaceState` (no server
   round trip, instant checkboxes); the URL wins when it changes from outside (Back, header search).
6. **Listings for all six families** exist (the plan designed three) because the Products menu links each family.
7. The filter parameter for verification method is `verify=` (Design Doc T4); the old `/category/visible-light`
   redirect uses it.

Still to build in the catalogue: the quote page itself (the store, add-to-quote and the header count are done).
Header suggestions now search a compact local product/software/solution index with 150ms debounce and keyboard selection (AT-03).

### Homepage decisions (Design Doc T1; Master Plan ch. 12, 14, 16, 18)

- Built on `codex/homepage`, branched from `main` and fast-forwarded to the prerequisite `claude/project-setup`
  commit (`164c202`). This keeps the homepage separate while retaining the catalogue and shell it needs.
- The approved hero prototype is ported with native Web Animations, 26 desktop / 14 mobile signal curves,
  a static verified state for reduced motion, and off-screen/tab visibility pausing. The scan beam uses
  `transform` instead of the prototype's animated `top`, per Design Doc ch. 8. The device is explicitly illustrative.
- The door-kit teaser is static: one signature animation per page. Its action opens the built access-control
  catalogue; the full interactive door story belongs to the future solution page.
- The proof band shows the **159 imported products and six families**, not unconfirmed company statistics.
  No founding year, client count or authorization claim is displayed. Existing approved catalogue taxonomy is retained.
- Three short review excerpts and reviewer names are sourced from [the live AIMS homepage](https://aimsuae.me/),
  checked 21 November 2026, and labelled as published by AIMS. No ratings, new endorsements or inferred claims are added.
- The homepage-only scope uses clearly marked live AIMS destinations for quote/contact, installation and software
  requests. The local quote page is still planned; the header explicitly explains that the saved preview list is
  not sent to the live site. Solution menu items open matching built catalogue families; locations opens the
  homepage showroom section. Unbuilt blog navigation is withheld. Existing canonical URL/redirect definitions stay intact.
- Location cards use the published phone lines and known showroom address/map in `src/lib/site.ts`.
  Missing office maps, exact addresses and opening hours are not invented. Arabic remains a draft for AIMS review.
- No new runtime dependencies, trackers, embedded third-party maps or remote runtime content requests are added.
  `next/image` uses `preload` for the hero; this Next version deprecates `priority` (local Next image guide).

**Shared grid correction (Design Doc ch. 6).** Header, footer, menu panels, homepage sections and catalogue
containers share `page-container`: 1280px content plus 32px desktop gutters (1344px border box), with 24px mobile
gutters. The hero artwork retains its wider stage, while its copy aligns with the shared grid. Browser checks compare
both content edges in English and Arabic to prevent the previous header/homepage margin mismatch.

**Motion and interaction completion (Design Doc ch. 6, 8–9).** The approved headline/device/wash entrances,
verification spring/tick drawing, chip movement, scan corners and gradient colours are ported. Navigation uses the
250ms green underline; family images zoom 1.04 on desktop hover; FAQ chevrons and action feedback use the motion
scale. Reduced motion removes introductions, loops and transitions. Menus expose their expanded state, move keyboard
focus into the desktop panel, and return it on Escape. The floating WhatsApp action appears only after leaving the
hero, hides near the footer/while editing, and opens a preview notice before a real chat; no message is sent by the site.

### Homepage verification

Checked on Node 22.23.5 / pnpm 10.28.0: `pnpm check` (60 unit tests), `pnpm format:check`, `pnpm build`,
`pnpm e2e --workers=4` (94 passed; eight existing viewport-specific exclusions), and `pnpm e2e:performance` (6 passed).
Axe reports zero violations across the built routes. Homepage checks cover English/Arabic at 390px and 1440px,
320px reflow, 44px visible touch targets, keyboard FAQ/search/menus, valid navigation, WhatsApp preview, reduced motion,
verification tick drawing and animation pausing. Selected suggestions scroll fully into view for keyboard users.
The hidden keyboard-only skip link is excluded from the pointer-target measurement using its actual clipping styles.
The axe smoke audit waits for finite CSS entrances to finish: auditing the approved eyebrow opacity fade mid-frame
measured transient blended text colours. Every axe rule remains enabled; loops continue and motion has separate coverage.

The isolated Chromium mobile run uses a cold browser cache, 390×844 viewport, 4× CPU slowdown, 1.6Mbps download and
150ms latency. Across three runs per locale, medians were: English LCP **1288ms**, CLS **0**, transfer **358KB**;
Arabic LCP **1360ms**, CLS **0.00038**, transfer **540KB**. These are local lab measurements, not field guarantees.
All six runs meet Plan AT-11. No third-party runtime
requests or page errors were observed. The animation source (controller plus helpers) is 6.3KB; its entire shared
homepage client chunk transfers at approximately 7.4KB gzip, below the 15KB animation budget.

For local preview, bind Next to `localhost` (for example `pnpm dev --hostname localhost`). Binding specifically to
`127.0.0.1` can conflict with the locale proxy's normalized localhost requests in this Next version.

## Content import

```bash
pnpm import:content            # uses the HTML cache in .cache/aims (gitignored)
pnpm import:content --refresh  # refetch everything
```

The importer crawls the 16 category pages, collects 162 unique products and parses each product page: title, specs,
overview, images and datasheet link. It also reads the 8 software pages. It normalises spec labels (for example
"Dimension(WxDxH)" becomes "Dimensions (W × D × H)"), derives facets (verification method, connectivity, outdoor),
maps each product to one of 6 families, and converts images to webp. Every record is validated with Zod.

The site never contacts aimsuae.me at runtime. Inside a sandbox whose proxy Node's `fetch` doesn't pick up, run the
import with `NODE_USE_ENV_PROXY=1`.

### What the import found (to raise with AIMS)

From `content/import-report.json`:

- **3 duplicate products**: `f18-1`, `biopro-mh20-1` and `biopro-sa20` repeat `f18`, `biopro-mh20` and
  `bio-pro-sa20`. The duplicates are hidden and 301 to the record with more spec rows.
- **`zkbio810` is titled "ZKAIO1000"**, the same title as `zkaio1000`. Both are kept until AIMS confirms which is right.
- **42 products have no structured specs.** On 22 more, the spec tab is empty and the importer reads the specs from a
  table in the overview.
- **6 products have no datasheet.**
- **All 8 software "Download" buttons open WhatsApp.** There is no direct download, so the Download Centre treats
  delivery as "request" until AIMS says files can be linked.

## Not yet confirmed by AIMS

Logo, ZKTeco authorization wording, founding year (2011 or 2014), opening hours, which phone number serves which need,
permission to link datasheets and software files, and an Arabic reviewer. `ar.json` is a first draft and needs that
review.

**Homepage polish audit (Design Doc ch. 2, 7–10, 12–14; Master Plan ch. 14, 18).** Each T1 section was checked
against both documents and against nuzon.me at 1440 and 390 px. Changes and deliberate choices:

- **External links** carry a ↗ mark (Design Doc 9, "View on current site ↗") and a screen-reader suffix
  ("opens aimsuae.me") instead of a second "on aimsuae.me" line under every action. The mark mirrors in Arabic.
  An e2e check requires the suffix on every external link in the page sections.
- **Buyer routes** are whole-card links (Design Doc T2 rule, "cards are real links with headings"). On phones they
  become stacked rows with the sentence hidden (Plan 14, T1 mobile: "routes as stacked rows").
- **Product families** add each family's one-line type summary and a count row with an arrow.
- **Door teaser** now ports the prototype's final frame faithfully: pill tags with model codes and hairline leaders,
  green LEDs, credential at the reader, open leaf, "Access granted", the ZKAccess event row and inside/outside
  labels. A numbered parts list is the text equivalent (Design Doc 14). The drawing stays static: the hero keeps
  the page's one signature animation. Tags are hidden on phones, as in the prototype.
- **Proof bar** shows four counted facts (products, families, software platforms, locations), still no company
  claims (Design Doc 3.1).
- **Software** cards state each platform's purpose, restated from AIMS's own summary, in place of "Software supplied
  on request" three times. The imported software images are not used: they mix a logo, a marketing collage and a
  low-resolution box shot, which fails Design Doc 7.
- **Showrooms** label office vs showroom, tint the Deira showroom (the place to visit) and keep only published
  addresses and phones.
- **Reviews** keep the three verbatim excerpts and published names, set as larger quotes.
- **FAQ** closes the page with a "Have a project in mind?" panel (one primary action, one secondary link). On phones
  it follows the questions so the page ends on the action.
- Mobile length fell from 8,726 to 8,476 px including the footer (about 8 screens of content against the plan's
  target of 7); the remaining length is mostly the six family tiles and three location cards, which the plan requires.
