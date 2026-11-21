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

### Quote decisions

1. **Labels follow the design review**: "Review quote request" while assembling (mobile bar), then "Continue to
   WhatsApp" and "Send enquiry" side by side. WhatsApp is not presented as "send", because the buyer still sends it
   in WhatsApp.
2. **Fields adapt to the need** (Design Doc T8): supply → city, timing · installation → emirate (required), site,
   doors, users, existing system · abroad → country (required), city or port, documents. The need and these fields
   are saved with the list for 14 days; **contact details are never stored**.
3. **WhatsApp needs items and the need only** (the chat is the reply channel); the enquiry also needs a name and one
   valid reply channel. Phones accept any country code (E.164), with no CAPTCHA (honeypot instead).
4. **Submission goes through `QuoteAdapter`** (`src/lib/quote/adapter.ts`). The preview uses `DemoAdapter`, which
   makes no network request; the receipt says "Demo: nothing was sent to AIMS" (AT-07). A production adapter (email
   or CRM via a server action, with a rate limit) plugs in there.
5. **Contact links are guarded** (Plan risk R5). Every WhatsApp, phone and email link (product pages, menu, footer,
   quote) opens a preview notice showing who would be contacted and the exact message, with Copy and a deliberate
   "Open anyway". Set `NEXT_PUBLIC_LIVE_CONTACT=true` in production to make them direct links.
6. The "signal lines converge into ✓" animation on send (Design Doc 8, SPEC) is not built yet; the receipt is static.

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

**Branch integration (homepage, solutions hub, quote list).** The three lines of work started from the catalogue
commit and are combined on `claude/solution-time-attendance`. Message catalogues were merged key by key (no key was
changed on both sides). Follow-ups from combining them:

- `navigationHref` now checks the route registry first, so every built page (including `/quote`) links locally and
  only planned pages fall back to aimsuae.me.
- The homepage's quote actions open `/quote`; installation and delivery cards open `/quote?need=install|export`,
  which preselects the need (Design Doc 12, "Get an installation quote"). The parameter is validated with Zod and
  anything else is ignored.
- Solution cards use one heading link stretched over the card. The earlier `aria-labelledby` gave a name that did
  not match the visible text (axe `label-content-name-mismatch`, WCAG 2.5.3).
- `html` has scroll padding equal to the sticky header plus 16px, so fields focused from the quote error summary land
  below the header, not under it (WCAG 2.4.11). This surfaced as an axe target-size failure on the quote page.
- The quote page uses the shared `page-container` grid.

### Time attendance solution (T3; Master Plan 12 #15, 14; Design Doc 8.3, 10)

`/solutions/time-attendance` is the first T3 page. Sections follow the template order: title and promise with two
actions → scroll explainer → choose-your-method guide → six terminals with Add to quote → installation and support
process with owners → software that fits → questions → closing band.

- **Explainer.** Design Doc 8.3 specifies "punch dots flow from a terminal into a timesheet that fills row by row
  → compiles into a payroll file icon"; there is no prototype, so it is built to that spec. `StoryProgress` (a small
  client leaf) sets the active step from an IntersectionObserver band across the middle of the viewport; CSS draws
  each state with opacity, transform and `stroke-dashoffset` only. The story never pins or blocks scrolling (four
  steps of about half a screen each). The punch loop runs only while the story is on screen. The server renders the
  final state, which is what reduced motion and no-JS visitors get. Inactive steps change colour (ink-400, 5.19:1)
  rather than fading, because 45% opacity failed contrast. Timesheet rows are labelled "Illustrative data".
- **Method guide.** Counts are computed from the catalogue; "Mobile & QR" counts both phone credentials and links to
  `?verify=mobile,qr`. The one-line guidance is general advice, not AIMS claims.
- **Terminals.** Six models chosen so each method is covered by a terminal with structured specs (editorial choice,
  `src/content/timeAttendance.ts`); card facts are verbatim, and Horus H1 says "Specs on request". On phones the row
  scrolls sideways with the next card visible (Plan 14, T3 mobile), never automatically.
- **Process.** Owners are named per step; no durations or warranty terms, because AIMS hasn't published any.
- **Actions.** Both quote actions open `/quote?need=install`. Software cards still open AIMS's current pages until the
  T6 pages exist.
- **Shared styles.** Buttons and text links moved from the homepage CSS to `src/components/ui/actions.css`, loaded by
  the layout. T3 classes use a `t3-` prefix because the hub's `solution-*` styles stay loaded after client
  navigation.

### Premium homepage direction (`claude/homepage-premium`)

On 21 November 2026 the client asked for a homepage that feels premium on every scroll, benchmarked against
NUZON's light, dark and gradient sections and background motion, but in AIMS's own brand. Their answers set four
choices: start from the Design Doc homepage; "rich but disciplined" motion; real products plus drawn visuals (no stock
photos); deep green plus lime. Under CLAUDE.md's rule 1 this overrides these Design Doc rules, on this branch only:
decorative motion (ch. 8), one animated moment per page (ch. 8), lime as decoration only (ch. 4: lime now carries
text and the closing button on night surfaces, where it is 5.8–8.5:1), and gradients as surfaces (ch. 13).

- **Rhythm:** light hero → light routes → **night** product families (white product cards, a scanner-light sweep) →
  light door kit → **green gradient** proof band → light software → **night** reach map and places → light reviews
  and questions → **night** closing band with drifting light → footer.
- **Motion:** one client controller (`ScrollEffects`, about 1 KB) reveals sections as they arrive, starts each
  scene once, counts the proof figures up from zero, and marks scenes off-screen so their loops pause. The door
  kit now assembles itself in the approved prototype's order when it comes into view (Design Doc 8.2). The reach map
  is Design Doc 8.3's "route line draws Dubai → Muscat / Nairobi", with lights travelling each route. CSS animates
  only transform, opacity and stroke-dashoffset.
- **Kept non-negotiable:** reduced motion shows every final state at once with no loops (tested); without
  JavaScript nothing is hidden; all text passes AA on every surface (night contrast pairs are listed beside the
  tokens); axe reports zero violations; the mobile LCP, CLS and transfer budgets still pass; proof figures are counted
  from data, and the map labels only places AIMS names (its offices, the GCC, and its Oman and Kenya pages).
- **Copy:** the FAQ's quote panel moved into the closing band, so the page ends on one action.
