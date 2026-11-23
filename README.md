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
  No founding year is displayed; the authorization line and company figures followed AIMS's confirmation (see "Homepage through the taste skill"). Existing approved catalogue taxonomy is retained.
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

1. **Labels follow the design review**: "Review quote request" while assembling (mobile bar), then "Send enquiry"
   (the filled main action, first) and "Continue to WhatsApp" (outline). WhatsApp is not presented as "send",
   because the buyer still sends it in WhatsApp. Site polish (22 Nov 2026) put the real send first.
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
6. **VERIFY on send is built** (Design Doc 8, "signal lines converge into ✓"): when the receipt mounts, three short
   lines labelled with the request's items, need and reply channel draw into a green-700 disc and the hero's tick
   strokes in, once, then stands (`VerifyMark.tsx`, `quote.css`; CSS only). Reduced motion shows the final frame,
   and focus still moves to the receipt heading.

### Solutions hub decisions (Design Doc 10.1 T2; Master Plan ch. 12, 14)

1. **Hub only, as planned** (`docs/superpowers/plans/2026-11-21-solutions-hub.md`): five need cards, an industries
   strip and an FAQ. The five T3 solution pages are not built yet, so each card links to its family listing and says
   so ("Explore attendance products"). The P2 finder is deferred.
2. **Each card's heading is its link**, stretched over the card with `::after`, so the whole card is clickable and
   the link's name is the title only (WCAG 2.5.3); the action line is visual. The first draft wrapped the whole card
   in one link labelled by part of its text, which failed axe `label-content-name-mismatch`. Built solution pages
   (time attendance) replace the catalogue fallback through `navigationHref`.
3. **"Explore the components" lists only what the linked listing contains** (CLAUDE.md §1). The draft promised
   attendance software, locks, speed gates and POS peripherals, which those listings don't have; they now read
   portable terminals, face recognition terminals, turnstiles and swing barriers, and biometric POS terminals. An e2e
   test checks each line against the catalogue.

### Contact decisions (Design Doc 10.1 T9; Master Plan ch. 12 row 8)

1. **"What do you need?" routes to AIMS's own channels**, never a guessed one (`NEED_CHANNELS` in `src/lib/site.ts`):
   sales and delivery abroad → WhatsApp/call +971 56 524 0495 (AIMS's "Order Now" and site chat); software and
   showroom visits → +971 4 880 8445 (every software "Download" button on aimsuae.me opens WhatsApp to it, and
   /enquiry lists it as the Dubai Showroom). AIMS publishes no separate technical support line, so the page offers
   "Software and setup" rather than inventing one.
2. **Three branch cards** use the addresses and Google Maps links from aimsuae.me/enquiry ("Our Branches"). Maps are
   links, not iframes: the plan's "map iframes" would make third-party requests, which CLAUDE.md §5 forbids.
3. **Opening hours aren't published**, so the page says so and asks visitors to call first, instead of showing hours.
4. **The short message becomes an advice line** in the quote request (Master Plan T9), so there is one place to send
   everything and contact details are entered once, on the quote page. "Delivery abroad" also presets the quote's
   need. All WhatsApp, phone and email links stay behind the preview notice (risk R5).

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

### Interaction layer (Emil Kowalski's design-engineering rules, 22 Nov 2026)

Audited against `emil-design-eng`. The client approved all four groups and asked that reduced motion keep a short
fade. Everything animates transform and opacity only (plus colour on hover), enters with the brand ease-out and
leaves faster than it arrives. Tokens: `--duration-hover` 150ms, `--duration-dropdown` 180ms, `--duration-card`
240ms, `--duration-drawer` 300ms in and 200ms out, `--ease-drawer`.

- **Desktop dropdowns.**
  - The panel fades in and settles 6px over 180ms and closes at once.
  - Switching from one open menu to another is instant.
  - Opening leaves focus on the button (WAI-ARIA disclosure); focus leaving the nav closes the panel.
  - Hover backgrounds fade.
- **Mobile menu.**
  - The sheet slides fully in from the inline-end edge (300ms, drawer curve) and leaves in 200ms; the backdrop fades
    with it.
  - Section links fade in as a section opens.
  - The Quote, WhatsApp and Call buttons press to 0.98.
- **Buttons, links and cards.**
  - The Quote pill's colours fade and its press matches `.home-button`.
  - Text-link underlines fade in.
  - "Request a quote" darkens on hover.
  - The card lift and the photo zoom share one 240ms timing.
- **Contact and FAQ.**
  - The WhatsApp button fades in and rises 8px when it appears.
  - The contact dialog grows from 0.96 at the centre.
  - FAQ answers fade in as they open.
- **Unchanged on purpose.** Search results and the "/" shortcut stay instant (keyboard, frequent), there are still no
  scroll reveals, and in-page jumps don't animate.
- **Reduced motion.** Overlays marked `.motion-fade` keep a 120ms opacity fade and never move; `.motion-disclose`
  content fades only. Everything else is instant under the global rule. Setting `translate`/`scale` to `none` was
  dropped by the CSS minifier, so the helper limits `transition-property` to opacity instead.

### Final Impeccable pass (adapt, harden, optimize, audit, polish; 22 Nov 2026)

- **Adapt.**
  - Portrait tablets up to 1279px (iPad Pro) take the stacked hero at its natural height; the side-by-side art had
    cropped the device there.
  - The one-screen section rule applies to landscape desktops only.
  - Header gaps tighten from 1024 to 1279px so "Search products" fits.
  - Checked from 320 to 2560px, in phone landscape and at 200% zoom: no horizontal scroll.
- **Harden.**
  - The reviews block is left out if no published reviews are on file.
  - Without JavaScript the door and map show their final state. The mobile menu button needs JavaScript; the footer
    lists every route (open, P2).
- **Optimize.** Arabic pages load two IBM Plex Sans Arabic weights (400, 700) instead of four: 500 falls back to 400
  and 600 to 700. Arabic fonts went from 253 to 163 KB, and throttled Arabic LCP from 2.6 to 2.45 s.
- **Polish.** Body copy uses `text-wrap: pretty`, so no Arabic or English line ends on a single word.
- **Audit:** 16/20 (from 13/20). Two detector items are false positives:
  - closing-band contrast, where sampled pixels read 6.8–9.4:1;
  - Inter, which is the Design Doc's face.

  The eyebrow above the h1 carries the approved claim; moving it needs AIMS's agreement.

### Site-wide polish (Taste + Impeccable + Emil, 22 Nov 2026)

One time-boxed pass over every built template: a shared step first, then four templates in parallel, then QA.

- **Shared.**
  - Keyboard focus is visible in every text field.
  - One card (`.ui-card`) and one button set (outline and small variants) in `ui/actions.css`.
  - The footer's link groups fold on phones; phones and addresses stay open.
  - Services and Support link to `/contact`.
  - Breadcrumbs are 44px targets, headings balance, and the outward arrow mirrors in Arabic and stays with its label.
- **Product.**
  - No horizontal scroll at 390px. That had been 12 pages, caused by long imported words and spec tables.
  - English data stays left-to-right on Arabic pages.
  - Add to quote presses and announces the new quantity.
  - "Often fitted with" items are cards with an outline Add.
  - A model-code chip, and the **Signal** moment "How it connects": lines draw from the model code to the
    connections and door hardware the product's own spec lists. It appears only with at least 2 items and never
    infers software.
- **Listing and compare.**
  - Shared card with an outline Add and the model code in mono.
  - Products with a photo and key facts come first.
  - Sticky filter rail on desktop, equal compare columns, a result-count tick, and compare-tray thumbnails.
- **Quote and contact.**
  - `?need=install|export` opens the site-details form.
  - Arabic phone examples stay left-to-right.
  - Shared buttons, with Send enquiry as the main action.
  - The **Verify** moment on send: lines converge into a check.
  - Contact uses the page container and gains the reach map band and "answered on" lines.
- **404, hub and time attendance.**
  - Unknown URLs render the localized 404 inside the shell (status 404), with a search, model chips and the
    **Unlock** moment reversed ("Access denied").
  - The header quote badge flashes a check on add.
  - Hub cards use the shared card.
  - The time attendance hero shows the F18 photo and enters once; under reduced motion the story keeps its
    natural height.
- **QA.**
  - Sweep: 344 routes at 1440 and 390, 688 loads: 0 overflow, 0 broken images, 0 console errors, one h1 each.
  - Full e2e suite and the performance budget pass.
- **Open (P1, already on `main`):** `/product/<unknown>` and `/products/<unknown>` answer 200 with the not-found
  UI. Under Cache Components the prerendered shell is sent before the page's `notFound()`. Fixing it needs a
  proxy-level check against the generated slug list.
- **Recommendations, not done in this pass:**
  - Clean the importer: summaries cut mid-sentence, SEO filler, glued words and "✔" runs in overviews.
  - Restructure the Solutions menu, which repeats Products.
  - Make the time attendance story a timed sequence instead of scroll-driven.

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

### Design authority: the design-taste-frontend skill

On 21 November 2026 the client chose the `design-taste-frontend` skill (tasteskill 2.5.1, `.agents/skills/`) as the
authority on layout, motion, imagery, copy style and finish checks, ahead of the Design Doc. `CLAUDE.md` records the
new order. Truth, accessibility, performance and SEO rules still come first, and the Design Doc still owns AIMS's
palette, wordmark, claims policy, Arabic/RTL and the approved prototypes. AIMS is classed as kind `tech` (hardware
sold and installed). Its real phone lines and showroom address are brief-given, which the skill allows, so they stay.

Consequence for `claude/homepage-premium`: its fade-in-on-scroll reveals and the counting band break the skill's
"scrolling moves nothing but the dealt moment" rule. The homepage must be reworked through the skill's plan, deal and
gate before that branch merges.

### Homepage through the taste skill (`claude/homepage-taste`, 22 Nov 2026)

The existing homepage was improved in place with the `design-taste-frontend` skill: same framework, routes, components,
content and brand, and no starter template or second design system. It follows the Impeccable critique and audit
(`.impeccable/`) and the client's answers: "bug, then motion", tone "confident and calm", all P1s, and the claim wording
"Authorized ZKTeco Distributor · UAE".

- **Prefetch storm (bug).** From `/`, Next 16's segment prefetch of `/solutions` and `/products?q=…` asked the
  proxy-rewritten homepage for the wrong segment (`/$d$lang/__PAGE__`, 404) and then looped on `/$d$lang`:
  about 2,400 RSC requests in 5 s. `prefetchSafe()` (`src/lib/navigationHref.ts`, unit-tested) turns prefetch off
  for those links in `NavigationLink`. An e2e spec scrolls five pages to the footer and asks for fewer than 80 RSC
  requests; repeated runs show 5–19.
- **Claims.** AIMS confirmed the authorization and approved its wording on 21 Nov 2026, so
  `ZKTECO_AUTHORIZATION_CONFIRMED` is `true` and the eyebrow reads "Authorized ZKTeco Distributor · UAE". The four
  company figures (`COMPANY_FIGURES` in `site.ts`) appear under "Figures stated by AIMS, November 2026" (Design Doc 3.1).
  The founding year is still not shown.
- **Copy (skill `copy.md`).** The h1 names the category and the place ("ZKTeco access control and attendance for the
  UAE"). Headings name things, buttons are a verb and an object ("See all products", "Request an installation quote"),
  and the caption under the hero art is gone (House rule 1).
- **Sections (skill `layout-v4.md`).** These blocks were under half a screen, so they were merged rather than kept as
  strips:
  - software now sits inside the product-families section;
  - figures and review excerpts form one proof section;
  - the showroom leads the reach section.

  On a desktop each section is exactly one screen tall (the catalogue two), with its content centred. The hero alone
  fills the first screen. Order: hero, routes, families + software, door, proof, showroom + map, questions, close.

- **One card (DESIGN.md Plinth Rule; skill `cards.md`).** White, a hairline, `shadow-1` at rest, 32px padding and
  16px body text in ink-700. A linked card lifts 2px to `shadow-2`. On night green the same card is night-800 with a
  hairline, and its edge turns lime on hover (the green glow and wide shadows are gone). Route cards lost their icon
  tiles. The proof band moved from a green gradient to the light showroom floor (paper-2). Green is used only for
  actions: the h1's second line is ink-600 and the lime button has no glow.
- **Motion (skill `motion.md`, three layers).**
  - The hero enters once and its loop now has a pause button (WCAG 2.2.2).
  - The door kit and the reach map are the two dealt moments: each plays once when it comes into view
    (`MomentTrigger`) and finishes even if scrolled away.
  - The hover and press layer: cards lift 2px, photographs zoom 1.03, buttons step 1px and press at .985.

  Removed: the scroll reveals, the counting figures, the scanner sweep, the drifting glows, the travelling map pulses
  and the pulsing ring (`ScrollEffects.tsx` and `reveal.ts` deleted). Reduced motion shows every final state.

- **Actionable door kit.** Each part's model code links to its product page (T5 is built for every catalogue
  product), so a trade buyer never retypes a code. The route cards preset the quote list's need
  (`/quote?need=install|export`), and the empty list says which quote it is.
- **Tablet.** Text cards stack below 1024px, photographs keep two across, the proof figures go 2 × 2, and the three
  places sit in a row under the map. From 1024 to 1279px the header search is narrower, its "/" hint hides, and its
  placeholder is shortened to "Search products", so it no longer cuts off.
- **Gate.** copy-lint: 0 FAIL. One WARN, the per-family counts, which come from the catalogue.
  `gate.mjs` still FAILs, mostly on checks that assume the skill's own page system, which this project does not adopt
  (the client asked to keep the existing one):
  - `.wrap` and its container lines (this site uses `page-container` and a wider hero stage);
  - the footer and skip-link layout;
  - split lines on the footer;
  - text-only sections (routes, proof, questions) and text-only cards (software, places): AIMS has supplied no
    photographs for them yet;
  - empty-area on the shortest sections;
  - two button styles (the lime close and the header outline).

  Five FAILs that conflict with CLAUDE.md are waived with reasons in `.taste-skill/waivers.json`: real phone numbers,
  the preserved WhatsApp button, the wordmark's lime dot, the ported prototype moments, and the six-family catalogue
  grid. No stand-in photographs were added.

### Software pages (`claude/software-pages`, 22 Nov 2026)

T6 for `/software` (Download Centre) and `/software/{biotime-9-5, biotimecloud, zkaccess-3-5}` (Master Plan 12 #4, #29–31;
Design Doc 10.1; skill `layout-v4.md`, `motion.md`).

- **"Add to quote", not "Download".** The Plan's primary CTA is Download, but no installer file is published and AIMS has not
  given permission to link software files (open question). Every software action adds one described line ("ZKAccess 3.5
  software: installer, licences and setup") to the quote list, and the page says AIMS sends the installer on request. This
  deviates from Plan 14 (T6) and Design Doc 12 ("Download + type + size"); revisit when AIMS supplies files.
- **Terminals come from AIMS's own product text.** A terminal is listed only when its product page names the platform
  (`namesSoftware`, `src/lib/software.ts`, unit-tested). BioTime Cloud is named by no product page, so its page shows how it
  is reached, from its own feature list, and asks buyers to confirm cloud support. "Start trial" (Plan #30) is left out: AIMS
  publishes no trial.
- **Features and capacity are AIMS's published lists** (English, marked `lang="en"` on Arabic pages); a platform without a
  capacity list shows none. Version date, file size and requirements tables (Design Doc 10.1) are not shown: the data has none.
- **One dealt moment per page:** the terminals diagram draws its lines once when it scrolls into view (`stroke-dashoffset`,
  `MomentTrigger`); the Download Centre has none. It is pinned LTR, because its lines are physical SVG coordinates.
- **The other five platforms** (Bio Security 3.2, BioTime 8.5, CVAccess, CVSecurity, mobile app) are cards that open AIMS's
  current pages, marked ↗; their `/software/{slug}` URLs are not built here.
- **Homepage contrast (resolved):** the lime-on-white `color-contrast` failure this branch found on `/` was fixed on `main`
  by the site-wide polish; `smoke.spec.ts` passes for `/` and `/ar`.

### Software polish and four solution pages (`claude/pages-polish`, 22 Nov 2026)

Merges `claude/software-pages`, polishes it to the site system, and builds `/solutions/{access-control, entrance-parking,
door-locks, pos}` on one data-driven T3 template (Master Plan 12 #16–19, 14; Design Doc 8, 10; skill `motion.md`).
`claude/solution-pages` was **ported, not merged**: it built the same pages from the taste kit's own markup, a second design
system (CLAUDE.md §2). `claude/homepage-unslop` is superseded by what is on `main` and was left out.

- **Software:** shared `.ui-card` cards, the shared button pair and filter chips with the catalogue's count tick. The
  terminals diagram (SIGNAL) draws lines only to terminals the platform's own data lists, so BioTime Cloud no longer
  borrows BioTime 9.5's. The Download Centre deals no moment: the data supports none honestly.
- **T3 template:** `defineSolutionPage({ slug, family, hero, products, methods?, software?, quote })` in
  `src/content/solutionPages.ts` (API documented there, unit-tested); each section takes its page data and copy.
- **One dealt moment per page, each the trade's own:** access control (UNLOCK, the door kit), entrance and parking
  (SIGNAL, a card opens the swing lane and the plate reader lifts the boom), door locks (UNLOCK, TL800 fingerprint, the
  bolt draws back, ZSmart logs "Opened"), POS (VERIFY on the ZKBio900 pad, a receipt from the ZKP8001). Each plays once
  and rests on its last frame under reduced motion. The drawings stay LTR in Arabic, as the door drawing does.
- **Truth:** counts come from the catalogue and are labelled with the listing's own filter names ("All 22 in
  Turnstiles & gates" includes non-turnstiles, so no card claims its own count; the hotel-lock filter includes the CR60W
  reader, so that card names its filter). Barriers without a boom length show "Specs on request". POS shows no prices.
  `zkbio810` (mistitled as ZKAIO1000 in the import) is excluded. Door locks and POS carry no software section: the
  software their specs name is not in the software catalogue.
- **POS photographs are 350 px wide;** the hero caps them at their own width so they never upscale.
- **Preview navigation:** all five solution slugs are built, so the fallback that sent unbuilt solution slugs to product
  families was removed.
- **Spec hardening, no assertion weakened:** axe now audits the settled frame on software pages (it measured the hero
  mid-fade); keyboard and style reads wait for the streamed listing and hydration.
- **Arabic copy on all four pages is a draft** for AIMS's reviewer (Design Doc 17).
- **Template follow-ups (not done):** a type-count helper and the moment step list are repeated in the door locks and POS
  modules; both could move into the template.

### Company and editorial pages (`claude/company-polish`, 23 Nov 2026)

About, Services, Support, privacy, terms and the blog (Master Plan 12 #5, #7, #10–14; Design Doc 10.1 T2/T3/T10, 3.1).
Ported from `claude/editorial-pages` and `claude/company-pages` onto the site system; neither was merged.

- **One importer, one content file.** `pnpm import:pages` (editorial-pages' importer) now also reads the ZKTeco
  warranty policy and the FAQ, which `/zkteco-warranty-policy` and `/faq` 301 to. It ran live against aimsuae.me on
  23 Nov 2026 and reproduced editorial-pages' legal and article content exactly (the h1 is no longer repeated as the
  first paragraph). company-pages' importer, its About and installation imports and its stopgap `/locations` were left
  out (agent L builds `/locations`).
- **About is built from `site.ts`, not AIMS's About text.** That text is mostly about ZKTeco, states the unconfirmed
  founding year and uses superlatives (Design Doc 3.1, "About AIMS, not ZKTeco"). The story restates only what AIMS
  publishes; the fact sheet reads `site.ts` and the catalogue; the figures and reviews are the homepage's proof
  section, unchanged.
- **FAQ filter** (`publishableQuestions`): item 11 has no answer on the live page, and item 1 calls AIMS a "Strategic
  Partner", which the claims policy replaces. Both are left out; the rest is verbatim, in English.
- **Support channels:** WhatsApp and email only. AIMS names no support phone line (open question), so none is picked.
- **Moments:** About deals SIGNAL (the shared reach map band, reused unchanged); Services deals VERIFY on the process
  (`signature/verify-moment.css`: the quote's mark, played once when its band enters view). Support, the legal pages
  and the blog have the entrance and the hover layer only: a moment on a policy, an FAQ or a list of articles would be
  decoration.
- **Editorial intros are compact**, not full-screen heroes: a policy or an article starts reading in the first screen.
  The T10 column is 680px (`--container-reading`) with an "On this page" index (sticky on desktop, a closed "Jump to"
  on phones).
- **Blog:** all 19 live article URLs kept, with AIMS's own images. Each article links to the solution its slug names
  (`articleSolution`, unit-tested) and a quote. No Article JSON-LD: the plan asks for Product, Organization and
  BreadcrumbList only.
- **Prefetch:** with these pages local, Next 16's prefetch loop came back (the router reads `/support` as the `[lang]`
  page). It picks different links on each load, so `prefetchSafe` (now `src/lib/prefetchSafe.ts`) keeps every English
  one-segment path off prefetch, and the language switch uses the same guard. They still load on click. A proper fix
  belongs in the routing (proxy or route structure) and needs a decision.
- **Raise with AIMS:** the Terms name the site "mssolution.me" and `info@mssolution.me` and show the date as
  "[30-09-2025]"; the privacy policy says "AIMS Security System LLC"; FAQ item 11 has no answer.
- **Arabic UI copy on these pages is a draft** for AIMS's reviewer (Design Doc 17). AIMS's text stays English with
  `lang="en" dir="ltr"`.
- **Not run:** the taste gate and copy-lint (not in this agent's checks).

### Locations hub and T7 location pages (`claude/locations-polish`, 23 Nov 2026)

`/locations` and `/zkteco-distributor-in-dubai` (paired with `/ar/zkteco-dubai`), `/zkteco-distributor-in-oman` and
`/zkteco-distributors-in-kenya` (Master Plan 12 #6, #32–35; Design Doc 8.3, 10 T2/T7). Ported from
`codex/location-pages`, not merged; the full ported and left-out list is in
`docs/superpowers/plans/2026-11-22-remaining-pages.md`.

- **Left out of the Codex branch, for the user to decide:** its CLAUDE.md gate waivers ("client approved"), the
  `docs/design-checks/*` gate records, the taste-kit class names it added to the shared header, footer and layout
  (`nav`, `wrap`, `closing`) so the gate's scanner would pass, the skip-link move, the visible floating search label
  and the narrower header search. Each changes the shared shell or the project rules to satisfy a checker.
- **Claims:** the Oman and Kenya H1s say "ZKTeco supply to …", not "distributor in", because AIMS lists no office
  there (Design Doc 3.1). "Popular models" became "Models to start from": no sales ranking is published. Codex's
  "training" claim was dropped; AIMS publishes installation and setup only.
- **URLs:** the Dubai page keeps both live URLs as a locale pair; `/zkteco-dubai` and `/ar/zkteco-distributor-in-dubai`
  301 straight to their partner (no chains; CLAUDE.md §6).
- **Moment:** the reach map draws once. The hub and Dubai show every route; Oman and Kenya draw their own route and
  light the market on arrival. Oman's map is cropped to the Gulf (`ReachMap` ZOOM), with text, strokes and dots
  divided by the crop factor so only the geography grows. The homepage and `/contact` maps render the same markup.
- **Quote destination:** Add to quote on a location page presets the export destination only while the buyer has
  chosen no need, so a page never overwrites a choice.
- **Prefetch:** the language switch never prefetches, and English one-segment links stay off prefetch
  (`src/lib/prefetchSafe.ts`). Through the locale rewrite, prefetching those pages looped (800–2,000 requests in 5 s).
  A request count on 19 pages at both viewports finds no loop. A routing-level fix in `src/proxy.ts` would let
  prefetch back on.
- **Open for AIMS:** the published Terms name "mssolution.me" and show the date "[30-09-2025]", and the Privacy
  Policy says "AIMS Security System LLC". They are shown as published.

### Three-skill audit of the later pages (23 Nov 2026)

The pages built after the site-wide polish (locations, company, legal, blog, the four T3 solution pages, software) and
the footer had Taste, Impeccable and Emil run on them in turn, by three agents. The findings, fixes and gate
results before and after are in `docs/audits/2026-11-23-{locations,company,solutions}.md`, and the plan is in
`docs/superpowers/plans/2026-11-23-three-skill-audit.md`. There were no P0s and axe stayed at 0 violations.

- **Gate status, stated plainly:** no page reaches `GATE: PASS`. About 25 FAILs on every page come from the shared
  header, the footer and the kit's own markup rules. Others conflict with CLAUDE.md: AIMS's real phone lines, the
  preview demo note, AIMS's own imported article and software text (§1), and the approved door prototype. These are
  recorded in the audit files, not waived: the kit allows five waivers and a sixth reopened all of them. copy-lint has
  0 FAIL on our copy.
- **One section per screen:** sections hold one desktop screen. The close is now the last block of the questions
  screen on solution and location pages, and that last screen keeps its natural height, because stretching short
  sections left mostly empty screens.
- **Headings:** the Locations, About, Support and Blog h1s now name ZKTeco or what is sold.
- **Footer:** a Blog link; popular searches as plain links (no third button style); hover underline and press dim;
  the Arabic copyright and address no longer scramble.
- **Reading pages:** 18px text from 640px (about 75 characters a line); "Jump to" and FAQ answers fade open; the blog
  index ends with the shared close.
- **Catalogue card:** long Arabic spec values align to the card's end edge, long model fields split into the code
  and a description (`splitModel`, unit-tested), and model links are 44px targets.
- **Motion:** the reach map starts its draw once the map is in view rather than at its top edge, and the Oman crop
  fades at its edges.
- **Shared fixes:** each breadcrumb separator now ends its item, so a wrap never opens a line with "/". The location
  cards' email link is a 44px target.
- **Decided with the user after the audit (23 Nov 2026):**
  - **Support gets a dealt moment:** the support route. AIMS's two published support channels, WhatsApp and
    email, draw into its support team and end in the check (`SupportRoute`, VERIFY parts). No phone line is drawn,
    because AIMS names none for support.
  - **Privacy, Terms, Blog and articles deal no moment,** a deliberate exception to CLAUDE.md §3: they are read, and
    a moment there would be decoration that delays the text. They keep the hero entrance and the hover layer.
  - **Eyebrows that repeat the breadcrumb are gone** ("Solution", "Locations", "Legal", "Blog", "Support"). Labels
    that state a fact stay: About's ZKTeco authorization, "Delivered from Dubai", Dubai's showroom line and Services'
    scope.
  - **The header search keeps its hidden label:** the magnifier, placeholder and `/` hint carry it visually, and a
    visible label would crowd the header.
  - **No stand-in Deira photograph:** on AIMS's own location pages it would read as AIMS's street or showroom
    (CLAUDE.md §1). A real showroom photo from AIMS goes in when supplied.

### Purposeful motion (`codex/purposeful-motion`, 23 Nov 2026)

- The client approved `docs/superpowers/specs/2026-11-23-purposeful-motion-design.md`: original domain motion on home,
  Access Control, Time Attendance, product details and software details. Master Plan ch. 6/9/14/16/18 and Design Doc
  ch. 3–9/13/14 apply. NUZON's audit is reference evidence, never a source of brand assets or implementation.
- This supersedes the earlier **timed door trigger** on home and Access Control: the approved illustration now
  follows native desktop scroll within two screens, reverses on the way back, and shows six real part links.
  Phones/short windows play once only when the drawing is visible, preserve progress on resize, and pause out of view.
- Attendance keeps its four stages and labelled sample rows; phone playback advances in visible time, with no pinned
  drawing over the text. Transport dots finish rather than looping while someone reads.
- Hero entrances use the existing AIMS tokens and whole text runs. Controls work immediately. Still green studio
  lighting sits behind the real hardware; homepage verification light shares the existing paused/offscreen-aware clock.
  Connection diagrams keep their text readable and draw only data-backed paths. Runtime reduced-motion changes finish
  the diagrams, including with multiple mounted triggers. No library, WebGL, competitor asset or new product claim.
- Review findings, decisions and verification are recorded in `docs/design-checks/purposeful-motion.md`.
