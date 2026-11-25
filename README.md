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
  checked 21 November 2026, and labelled as published by AIMS. Each shows the five-star rating it carries there
  (`rating` in `CUSTOMER_REVIEWS`, `src/lib/site.ts`, checked 22 November 2026); the stars are drawn from that field,
  never hard-coded. No new ratings, endorsements or inferred claims are added.
- The homepage-only scope uses clearly marked live AIMS destinations for quote/contact, installation and software
  requests. The local quote page is still planned; the header explicitly explains that the saved preview list is
  not sent to the live site. Solution menu items open matching built catalogue families; locations opens the
  homepage showroom section. Unbuilt blog navigation is withheld. Existing canonical URL/redirect definitions stay intact.
- Location cards use the published phone lines and known showroom address/map in `src/lib/site.ts`.
  Missing office maps, exact addresses and opening hours are not invented. Arabic remains a draft for AIMS review.
- No new runtime dependencies, trackers, embedded third-party maps or remote runtime content requests are added.
  `next/image` uses `preload` for the hero; this Next version deprecates `priority` (local Next image guide).

**Shared grid correction (Design Doc ch. 6).** Header, footer, menu panels, homepage sections and catalogue
containers share `wrap`: 1280px content plus 32px desktop gutters (1344px border box), with 24px mobile
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

1. **Hub as planned** (`docs/superpowers/plans/2026-11-21-solutions-hub.md`): five need cards, the site plan, an
   industries strip and an FAQ. All five T3 solution pages are built, so every card opens its solution page and its
   action line names that page ("See how access control works"), not products (23 Nov 2026). The P2 finder is
   deferred.
2. **Each card's heading is its link**, stretched over the card with `::after`, so the whole card is clickable and
   the link's name is the title only (WCAG 2.5.3); the action line is visual. The first draft wrapped the whole card
   in one link labelled by part of its text, which failed axe `label-content-name-mismatch`. Built solution pages
   (time attendance) replace the catalogue fallback through `navigationHref`.
3. **"Explore the components" lists only what the linked listing contains** (CLAUDE.md §1). The draft promised
   attendance software, locks, speed gates and POS peripherals, which those listings don't have; they now read
   portable terminals, face recognition terminals, turnstiles and swing barriers, and biometric POS terminals. An e2e
   test checks each line against the catalogue and, since the cards open them, against the solution pages.
4. **Hero entrance:** the intro uses the shared AIMS entrance (`motion/entrance.css`): the title rises from its mask
   and the lead follows, with the T3 tokens. It has no photo, so no studio light. Reduced motion: still.
5. **Dealt moment, "One site, five systems"** (`SolutionSite`, `SitePlanDrawing`, `site-plan.css`): a top-down plan
   of one business site in the door kit's line style, with a numbered point for each solution where it sits on a
   site (barrier and turnstile at the gate, the controlled main door, the terminal at the staff entry, an office
   door's lock, the shop counter) and one controller node. When a third of the section is in view (MomentTrigger),
   lines draw from the node to each point in turn and each point lights once with a lime ping (about 2.2 s), then
   it stands. Transform, opacity and stroke-dashoffset only; reduced motion and no-JS show the finished plan.
   - **Placement:** its own section between the cards and the industries strip. The cards answer "what", the plan
     "where on my site", the industries "for which kind of site"; it holds one screen at 1440 × 900.
   - **Links:** the SVG is decorative (`aria-hidden`, LTR in Arabic like the door and reach map). A numbered HTML
     list beside it (below on phones) holds the five real links in visit order, gate to counter, with names from
     `t.solutions[slug].name`, so the section reads the same without the plan. Hovering or focusing a link rings its
     point. Phones drop the names from the plan and enlarge the markers rather than shrinking them.
   - **Truth:** an illustration only, with no models, counts or claims. The node is unlabelled and the copy makes
     no integration claim: it does not say the five systems run on one controller (CLAUDE.md §1).

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

### Checker fixes (Phase 4 polish, 23 Nov 2026)

1. **Reverted by the client: no forced screen heights.** Phase 4 first gave `Section` the skill's `--h` contract
   (every section one or two screens tall, the footer one screen). On review the client found whole screens left
   empty on 57 of 88 page/width views (blank bands up to 1,100px), and asked for the rule to be taken out (23 Nov
   2026). Sections are now their content plus the one `--section-space` rhythm; only the home, split and product
   heroes fill the first screen. A full-site audit (every built route in English plus five Arabic routes, at 1440
   and 390) then found no blank band over 40% of a screen. This overrides CLAUDE.md §2 "one section per screen" by the
   client's explicit instruction; the gate's `screen-height` and `section-height` checks will report short sections.
2. **The `.wrap` box is the content line.** Its gutter is margin outside the box, not padding inside it, because the
   skill's checker reads the container from the `.wrap` box; every section and hero has one in-flow `.wrap`.
3. **One split line.** The hero, FAQ, reach band and proof splits put their right column seven of twelve columns
   in, top-aligned (SR-8).
4. **The closing panel sits in normal flow** now that sections are no longer stretched to a screen.
5. **Footer popular searches are plain footer links**, like the link columns above them: chips are Design Doc 9
   filter controls, and a chip look on every page was a third button style.
6. **Waivers (`.taste-skill/waivers.json`, the gate's limit is five):** the wordmark's lime full stop (decorative
   brand mark); the floating WhatsApp button (behaviour the client asked to keep); and, for the door-kit and reach
   prototypes that are the home page's two dealt moments, `effect-kind` once and `scroll-reveal` for each (CLAUDE.md:
   port the approved prototypes, don't redesign them; reduced motion shows them at rest). Not waived for lack of room,
   and open in the gate: AIMS's four published phone numbers (`phone-number`, brief-given, they stay) and the
   six-card families grid (`card-layout`).

### Site-wide polish: decisions and results (branch `claude/blissful-goldberg-rhevpy`, 23 Nov 2026)

The phase-by-phase log is in `docs/polish-progress.md`. Decisions the client made or that stay open:

1. **/support keeps its three hero actions** (WhatsApp, email, contact page). This deliberately goes one over the
   design rule of two actions per screen; the client chose to keep all three published channels (23 Nov 2026).
2. **Solutions hub hero has no action.** Adding one needs new wording, which is never invented. The hero uses the
   InBio Pro 160 photograph so that no card below repeats it. The client can swap the photo or supply a button.
3. **Product close-up moment.** Only F18 and SA20 have a connection diagram (their dealt moment). The other four
   product pages use the spec close-up "developing" once as their moment. The skill lists that moment for
   place/product/service pages rather than tech; kept pending the client's view.
4. **Design calls for consistency** that the client may reverse: the home closing heading at the shared h2 size
   (38px, was 52px); the solutions hub industries band on the shared light-grey band (was mint); product section
   headings at the shared h2 size.
5. **No stand-in photographs were added.** Every new image slot uses AIMS's own product photographs.
6. **Merged with `main` (PRs #11–#14 and purposeful motion).** Where the two lines of work disagreed, main's merged
   behaviour was kept on the polish's components: the solution pages, location pages and locations hub end with the
   close inside the questions screen (`ClosePanel embedded`), so item 4 of the checker fixes now applies only to the
   pages that keep a separate close; the solutions hub's dealt moment is main's site plan, not the door kit; the
   location pages start the reach moment on the map frame (`ReachBand trigger="map"`); and the attendance dots are
   finite, so the polish's pause button for them was removed. Main's desktop "one section per screen" rules for the
   T3, location and company pages were not ported: section heights belong to the shared `Section`. The short-phone
   page-title size applies to every `PageHero`, not only the software pages.

Results at the end of Phase 4:

- `pnpm check`, `pnpm format:check` and `pnpm build` pass; `pnpm e2e` 477 passed, 17 skipped (existing skips), 0
  failed.
- **Gate (home): `GATE: FAIL 65`, down from 84, with five waivers.** The gate stays open after its last round; the
  open findings are recorded here. Most are structural checks that need a client decision or a page redesign:
  `edge-left` (text inset by card padding in the families grid), `container-edges` (the header and skip link
  outside the kit's page shell, and the approved full-width hero signal lines), `section-air` and `sparse`/
  `empty-area` (short sections now one full screen each), `phone-number` (brief-given, stays), `card-layout`
  (families grid) and `text-only` sections.
- **Consistency checker (1440 + 390):** /solutions 87 → 62 FAIL after Phase 4; the other families moved little from
  the first audit (for example product 81 → 74, products 62 → 58, about 76 → 71) because their remaining findings
  are the same structural checks.
- **Performance (perf.mjs, 390px):** home transfer 517 KB (limit 1 MB), layout shift 0.000, blocking time 13 ms, no
  WebGL. The product page reports five images "without width+height": they are `next/image` with `fill` inside a
  sized parent, which CLAUDE.md §5 allows, and layout shift is 0.000, so no change was made.

### AIMS mint white and forest greens (client decision, 24 Nov 2026)

**Superseded (24 Nov 2026)** for the light grounds by "White pages, faint bands, hero signature" below; the forest
greens stand.

- **AIMS's own ground: one mint everywhere.** Every light surface (page, bands, footer) is `--color-page` (#f0f6f1);
  `--color-paper-2` now points at it, and bands are parted by hairlines. A greyish stone tint (#f6f7f2) was tried and
  rejected as off-brand and dull; a two-step mint (#f7fbf8 page, #f0f6f1 bands) was then dropped because the lighter
  sections read as white strips between mint ones. The plain sections' corner wash is gone, and the families and
  closing bands' washes were then removed too: every light surface is one flat mint. Cards, fields, menus and product photo frames stay pure `--color-paper` (#ffffff), so
  cut-out photographs keep a clean white plinth. Text keeps AA on the mint (ink-400 4.7:1, green-700 5.5:1); input
  borders (`--color-line-strong`) darken to #7c8781 to keep 3:1 against it.
- **Forest greens.** The night bands shift toward the same palette: night-900 #0f1f17, night-700 #1e3a2e. Night text,
  muted text and lime keep AA, including under the softened top glow (lime 9%).
- One token change reaches every page: the body, the sticky header, the light home bands, the product stage and the
  reach map's fade now use `--color-page`; nothing else was edited page by page. The palette's sage and full-strength
  stone were not used for text or grounds: they measure 4.3:1 and 1.7:1 on white.

### Card review (Impeccable critique + charles-unslop, 24 Nov 2026)

Two reviews of `claude/hero-model-label` agreed: Impeccable's critique scored it **28/40** (Consistency 2/4,
Aesthetic 2/4) and charles-unslop flagged the template tells. White cards (#ffffff) on the mint ground (#f7fbf8) step
only about 1.04:1, so text-only boxes read as template-cheap, while product cards read as premium because the white
is the photo's plinth. The client approved this plan:

- **Open rows for text.** The home buyer routes ("Three ways to buy") and software are open rows on the ground: a
  1px `--color-line` rule, the title, one line and the arrow link, three across on desktop and stacked on phones,
  after the proof band's three points. Each row is still one link with the underline-draw and press layer. Software
  labels move from green to ink-600 (One Sign Rule), also on the solution pages.
- **Closing band.** `ClosePanel` is a full-width band on the page mint, parted by a green-100 hairline with its content
  in `.wrap` and no border, radius or box, on every page that closes with it. Embedded closes, inside another
  section, keep the mint panel.
- **Card edges (client's choice).** Product photo cards keep an outline plus a very soft green-tinted shadow
  (`--shadow-plinth`) and lift 2px to `--shadow-plinth-lift` on hover, through `.ui-card-plinth` on the home family
  cards and the catalogue product cards. Family photos grow to a 16rem box (9rem on phones), still below every
  photo's own pixel size, and the photo/text divider goes.
- **Removed:** the repeated authorization pill in the proof band (hero, about hero and footer keep it), the green
  glow under primary buttons (`--shadow-home-action` deleted; buttons rest flat), and the lime border on the reach
  band's showroom card (night hairline now).
- **Kept, by the sources:** the "ZKTECO" brand line on catalogue cards stays, because Design Doc 9's product card
  anatomy lists it; dropping it needs a Design Doc change. The review stars stay because each review's `rating`
  records the five stars shown on the AIMS homepage (checked 22 Nov 2026) and the stars are drawn from it; the small
  neutral initials stay.
- DESIGN.md's Plinth Rule now raises only product photo cards and sets text as open rows. Its ground colour now reads
  `--color-page` #f7fbf8, mirrored in `.impeccable/design.json`.

### Journey section and one process design (client mockup C, 24 Nov 2026)

- **Home journey.** The client's mockup C section, "From the first call to a working system", sits after the
  showroom reach band and before the FAQ: hero · proof (night) · routes · families · software · door · reach (night)
  · **journey** · FAQ · close · footer. It is open on the flat mint, closed by a hairline so it never runs into the
  FAQ, with no white box. The home page keeps its two dealt moments; the journey moves only on the pill link's hover
  and press layer.
- **One component.** `src/components/ui/JourneySteps.tsx` (+ `ui/journey.css`): numbered circles with a line icon,
  joined by a green-700 line, step one filled green-700; badges green-700 with white numerals (6.07:1) and aria-hidden,
  because the `<ol>` gives each position; a lime ring only on step one's badge. It follows its container: a vertical
  timeline on phones and narrow columns, one row once every step keeps about 11rem. It now carries the home journey,
  `SolutionProcess` on the five T3 solution pages, `ServicesProcess` on /services, the support steps on /support and
  `SoftwareSetup` on the software pages. The location pages' three "steps" stay as they are: Dubai's are three
  alternative routes and Oman's and Kenya's a checklist for the quote, not a sequence. The old `.process-*`,
  `.co-steps` and `.sw-steps` styles are deleted.
- **Owner labels** ("You", "AIMS engineer") moved from green-700 to ink-600 (DESIGN.md One Sign Rule: green is for
  actions only).
- **New copy (English; Arabic as a draft):** heading "From the first call to a working system"; lead "You don't need
  a model code. Describe the site, and AIMS takes it from there."; "Tell us the job" / "Call, send a WhatsApp, fill in
  the quote form or visit the showroom in Deira."; "Get a quotation"; "Supply" / "AIMS supplies the ZKTeco hardware in
  the UAE and delivers project and export orders to the GCC and Africa."; "Install" / "AIMS installs and connects the
  devices across the UAE, from Dubai and Abu Dhabi, and sets up the software."; "Support" / "After handover, AIMS
  supports the system. Reach the team by WhatsApp or email."; pill "Start with step one now.". Step two's line and
  the "Describe your site" link reuse existing strings. Every claim is one the site already states (contacts in
  `src/lib/site.ts`, the services and support pages); the mockup's "walk into the showroom" became "visit", since
  opening hours are still unconfirmed, and no training or durations are promised.

### Software section (client request, 24 Nov 2026)

- **Why it moved.** BioTime 9.5, BioTime Cloud and ZKAccess 3.5 were three text rows at the foot of the families band
  and got too little attention. They are now a section of their own (`HomeSoftware`, h2), directly after the families
  band and before the door kit. Ground: **paper**, closed by a hairline. Families is the light band with a wash, so a
  second band beside it would read as one; paper alternates with it, and the hairline at its end keeps it apart from
  the door kit's paper.
- **The diagram** (`SoftwareFlow`, inline SVG and CSS, no software screenshots) shows how records flow: real AIMS
  terminal photos with Plex Mono model codes → the three platforms → what the buyer gets. Every line comes from AIMS's
  data (`src/lib/softwareFlow.ts`, unit-tested against the import). The terminals are iFace 990, Biopro SA20 and inBIO
  260, because their AIMS product text names BioTime and/or ZKAccess (`namesSoftware`). The F18 and the hero's
  SpeedFace were not used because no AIMS page names either platform for them. No product page names BioTime Cloud,
  so it takes a dashed line from attendance terminals in general, marked "Confirm your model with AIMS", as on its own
  page. The outputs are payroll reports (BioTime 9.5 "Comprehensive Reports", BioTime Cloud "Detailed attendance and
  payroll reports"), shifts, leave and overtime (BioTime 9.5 "Flexible Shift & Scheduling Management", BioTime Cloud
  "Leave management and overtime tracking"), attendance reports (both, plus ZKAccess "Integrated time attendance and
  reporting system"), live door events (ZKAccess "Real-time door monitoring and activity tracking") and door
  permissions (ZKAccess "User management and access permission control").
- **Choices below it:** three open rows in the drawing's order, each showing where the platform runs (existing copy:
  own server, cloud with no local server, a Windows PC), its name in mono, its purpose and a link to its page. "All
  software" stays. Hovering a row dims the other lines (opacity only).
- **Static.** The home page's two dealt moments are the door kit and the reach map (CLAUDE.md §3), so the drawing does
  not animate. A draw-once animation and a third home moment were briefly approved, then dropped by the client as not
  needed (24 Nov 2026); the CLAUDE.md change was reverted. The drawing keeps the hover highlight only.
- **Accessibility and layout.** The drawing is one `role="img"` whose name states every line as text. At 768px and up
  it has five columns; under 768px it reads top to bottom (terminals, platforms, outputs) with no per-node lines and
  no horizontal scroll. In Arabic the flow runs right to left and model codes stay LTR.

### White pages, faint bands, hero signature (client decision, 24 Nov 2026)

Supersedes "AIMS mint white and forest greens" (the one-mint ground) above; the night greens stay. The client wanted a
brighter page; a measured benchmark uses pure white pages with barely-tinted alternate bands, and nothing else was
taken from it. The client asked for AIMS's own motifs, not a copy of the benchmark's ribbon or network pattern.

- **Grounds.** `--color-page` is #ffffff (body, header, heroes, paper sections, `themeColor`); `--color-paper-2` is
  its own faint green tint #f7faf8 (`section-band`, the footer, wells, hover washes); `--color-line` is the
  green-tinted hairline #e1e9e3. Measured: ink-400 5.19:1 on white and 4.94:1 on the tint, ink-600 7.4:1 and
  green-700 5.8:1 on the tint, input borders (`--color-line-strong` #7c8781) 3.7:1 and 3.5:1.
- **Cards.** Every white `.ui-card` keeps its radius and a 1px `--color-line` border and rests on a soft two-layer
  shadow that falls only below it (`--shadow-plinth`: `0 1px 2px` and `0 12px 32px -20px`, night-800 at 4% and 18%);
  linked cards lift 2px to `--shadow-plinth-lift`. The plinth class and `--shadow-1` are gone: one shadow for all.
- **Home rhythm.** Hero (white) · proof (night) · routes (white) · families (faint band, hairlines) · software
  (white) · door (white) · reach (night) · journey (white) · FAQ (faint band) · close (white, green-100 top hairline)
  · footer (faint band). Only grounds changed. Software and door meet on a hairline; a band followed by the close,
  or ending a page above the footer, drops its bottom hairline so the join has one line. The contact and quote pages
  lose their tinted `main` (it met the white hero on a bare edge, like a strip) and stand on white like the rest.
- **Hero signature.** Every `PageHero` carries a still watermark of the home hero's signal lines (`HeroSignature`
  over `SignalArt`; the curves from `src/lib/signalPaths.ts`, which the animated home hero now shares, unit-tested
  to keep its geometry) and a soft green-100 light at its top (`--gradient-hero-glow`). On split heroes the fan
  meets at the photograph's centre and thins out round it; on compact ones it leaves past the top end corner. At
  most 18% green-700, faded before the copy and at the edges, mirrored in RTL; phones show a small fan behind the
  photo (split) or the light only (compact). Inline SVG, no images, no layout box, no motion. To keep the photos
  blending with no box, the hero is its own stacking context on white, the studio box no longer isolates, and the
  photo (not its box) settles on entry. The product hero takes the light only: its lit stage fills the media column.
- **Section arcs.** The home families band and journey carry faint arcs of the same fan in their top end corner
  (`SectionArcs`, 12% green-700), fading before the cards and steps; hidden under 768px.
- **Contrast with the motifs.** Where a hero line can reach the copy it is at most 8.5%: ink-600 6.3:1 and green-700
  4.9:1 over line and light together. Under a full-strength arc, green-700 links keep 4.9:1 on the band.

**Listing pagination is numbered, and a buyer is never left without a next step (24 Nov 2026).** Design Doc ch. 9
specifies "Load more + numbered fallback"; the client asked for paginated results, so the products listing shows 12
a page with numbered links (`?page=` in the URL, real `<a href>`s, Back returns to the previous page). The same
change adds sort (Relevance, Name A–Z, Family), a "Popular" row of eight one-click filters with live counts (not on a
family page), collapsible facet groups, an always-present "Can't find your model?" panel (add a free-text line to the
quote, WhatsApp or call, with the search text carried over), and zero-results recovery ("Closest models", and
"Remove <filter> (n products)"). The panel promises only that AIMS "will check availability and reply": aimsuae.me
never says AIMS sources unlisted models (checked 24 Nov), so the page doesn't either. Arabic wording for the new
strings is a draft for AIMS to review. Design note: `docs/superpowers/specs/2026-11-24-products-listing-findability-design.md`;
plan: `docs/superpowers/plans/2026-11-24-products-listing-findability.md`.

**The solutions hub opens on its cards (24 Nov 2026).** `/solutions` used the split hero: an unrelated controller
photograph beside the title and a full screen of blank space before the first card. At the client's request it now
uses the compact hero (no photograph, no forced screen height), so the five cards start on the first screen. This
departs on purpose from the design skill's "hero alone on the first screen" rule for this one page.

**A cleaner hero corner (client decision, 24 Nov 2026).** The divider above the hero's model label is gone; it crossed
the signal lines and separated nothing. The client also asked for no pause button over the hero while the loop keeps
running. WCAG 2.2.2 (CLAUDE.md §3) still needs a way to pause motion that runs past 5 s, so the button stays in the
page but shows only on keyboard focus, like the skip link: mouse and touch visitors never see it, keyboard and
screen-reader users can still pause. Reduced-motion visitors get the still hero as before. The e2e test now presses the
button by keyboard, the way its users reach it.

**Night-green footer (client request, 24 Nov 2026).** The footer moves from the pale paper ground to AIMS's night
green (`--gradient-night`), closing every page on the brand's dark band, as most professional B2B footers do. It is
rebuilt on one grid: at 1280px and up the wordmark, partner line and contacts take four of twelve columns and the four
link groups the other eight, with the column headings on the wordmark's centre line. The contacts become a grid with
each label over its number (four columns from 640px to 1279px, sharing the link columns' lines below it; two on a
phone and on wide screens), the address gets its own "Directions" link under it, and the per-row phone icons are gone
(the labels say it). Popular searches share one line with their label from 640px; the legal line closes under a
hairline. Text uses night-text (15.0:1) and night-muted (8.6:1); the focus ring turns lime (7.5:1); WhatsApp's own
green marks its line (`--color-whatsapp-on-night`, 8.6:1). No page ends on a night section, so the footer never
merges into one; a night-line hairline marks its top edge regardless.

### Premium pass (client decisions, 24 Nov 2026; branch `claude/premium-pass`)

The client approved the premium-pass mockup and asked to build it with more character. These decisions override the
older rules they touch; CLAUDE.md §3 was updated by the client to allow the scroll reveals.

- **Archivo for display** (decision 1). Headings, figures and the wordmark use Archivo (SIL OFL, self-hosted in
  `src/app/fonts/` with its licence) through `--font-display`, set wide (`--font-stretch-display` 115%, weight 650,
  `--tracking-display`). One shared rule in `globals.css` applies it to `.section-title`, `.page-hero h1`,
  `.ui-close-title`, `.home-display`, `.home-figure` and `.ui-display`, so every page has it. Body stays Inter, codes
  IBM Plex Mono; Arabic glyphs fall through to IBM Plex Sans Arabic in the same stack. Section titles grew to 44px.
- **Two-line hero headline** (decision 2). The client rejected the mockup's three- or four-line wrap: from 1024px
  `line1` and `line2` never wrap. Archivo is set a step narrower there (`--font-stretch-hero` 104%), the size follows
  the viewport (`--text-home-display`, 45–62px) and the verified frame shrinks with the width, so both lines clear
  it at 1024, 1280 and 1440 in both languages (tested). Arabic is 8% smaller, as Plex Arabic sets wider.
- **Signature button** (decision 3). The one primary is a night-green pill with a lime arrow circle (the existing
  `ArrowIcon` child becomes the circle, so no markup changed), inverting to white with a night circle on night
  grounds. Hover sweeps a deeper night in, steps 1px and nudges the circle; the hero and closing primaries lean
  toward a fine pointer (`Magnetic`). The secondary is a text link whose green underline draws over a pale one.
  Outline, quiet, icon and WhatsApp variants are unchanged. This deliberately replaces green-700 as the primary fill.
- **Verified frame** (decision 4). The home hero's signal lines are gone. Four corner brackets lock onto the real
  SpeedFace photo, one lime scan sweeps down, the "Verified · Face · Entrance A" tick lights and a border beam runs
  round the frame twice; everything is still by 4.6 s. The screen's verification loop and its keyboard-only pause
  button stay. The entrance runs longer than the old 1.1 s because the client specified this sequence.
- **Ridge lines, the one motif** (decision 5). `ridgePaths()` draws the mockup's fingerprint contours (unit tested);
  the root layout defines them once as an SVG symbol and `<Ridges>` places a masked reference behind the hero
  terminal, on the software band, on the closing band and on every inner hero. `SignalArt`, `SectionArcs`,
  `CloseSignal` and the hero's `SignalLines` were removed. The families band has no motif (the mockup's calm white).
- **Calmer home** (decision 6): hero · four company figures · model-code strip · six family tiles · stand-in photo
  places · software (night) · showroom and offices · closing (night) with the journey as one line of steps. The FAQ,
  buyer routes, reviews strip, door teaser and reach map left the home page. Components nothing else used were
  deleted; `HomeProof` (with the reviews), `ReachMap` and the door drawing stay for the about, contact, locations and
  access control pages. With the door and the map gone the home page's moments are the scroll-driven ones below.
- **Night closing band.** `ClosePanel` is now a centred night band over the ridges with the inverted button on every
  page; the embedded mint panel (solution and location questions) is unchanged.
- **Character** (decision 7, no new dependencies): spotlight cards on the family and photo tiles, the scan reveal on
  the photographs, the model-code strip (a self-running ticker since 25 Nov 2026 at the client's request, not tied to the scroll; it loops past 5 s, so it pauses off-screen, on hover and focus, and by a keyboard-only button like the hero's, and rests under reduced motion), the border beam and the magnetic primary. **Scroll reveals**:
  every `Section` raises its blocks 24px and fades them in over their first 12rem, and plain-text section titles rise
  word by word (`SplitWords`), all through CSS `animation-timeline: view()` inside `@supports`; dealt moments and
  blocks holding fixed or sticky UI are left out. Without support or under reduced motion everything stands.
- **Tests.** The smoke test audits resting text, so it no longer waits on scroll-driven animations (they follow the
  scroll, not the clock) and sets them to rest before axe. Home specs for removed sections were replaced by checks of
  the new order, the two-line headline, the verified frame, the reveals and the reduced-motion rest.
- **Header** (coordinator request): nav items and the quote button never wrap, and the search field is 14rem below
  1536px, so the Arabic header holds one line at 1280 and 1440.

### Stand-in photographs (premium pass)

`HomeWhereItGoes` ("From the front gate to the last door") uses four licensed stand-in photographs from Wikimedia
Commons, all CC BY-SA 4.0. They show the kinds of places AIMS equips, **not AIMS premises, staff or customers**, and
are stand-ins to replace with AIMS's own installation photographs. Each `<img>` carries `data-source="stand-in"`, has
no caption, and is credited in the footer's one line (`footer.standIns`). Converted to webp at the 1280 px Commons
size, under 235 KB each, in `public/images/stand-ins/`. The scan reveal on the tiles is scroll-driven CSS
(`animation-timeline: view()`, transform and opacity) and absent under reduced motion or without support.

| File                                                                                        | Commons page                                                                                                                                                                                               | Author     | Why it fits                                                                                     |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `office-lobby-speed-gates.webp` (Office towers → /solutions/entrance-parking)               | [Fukuoka Daimyō Garden City Tower turnstiles](https://commons.wikimedia.org/wiki/File:Fukuoka_Daimy%C5%8D_Garden_City_Tower_the_turnstiles_on_the_3rd_floor_Ch%C5%AB%C5%8D-ku_Fukuoka_20240812_153528.jpg) | Hirho      | Glass speed gates in an office lift lobby; green marble echoes AIMS green.                      |
| `hotel-corridor.webp` (Hotels → /solutions/door-locks)                                      | [Corridor at Sokos Hotel Pier 4](https://commons.wikimedia.org/wiki/File:Corridor_at_Sokos_Hotel_Pier_4.jpg)                                                                                               | JIP        | A clean guest corridor lined with room doors, where RFID hotel locks go. No brand mark visible. |
| `office-building-glass-entrance.webp` (Building entrances → /solutions/access-control)      | [TPE-DORTS-SDPO Building main entrance](https://commons.wikimedia.org/wiki/File:TPE-DORTS-SDPO_Building_main_entrance_20200726.jpg)                                                                        | Solomon203 | Glass entrance doors: the classic controlled door (reader, controller, EM lock).                |
| `reception-lobby-optical-turnstiles.webp` (Reception lobbies → /solutions/entrance-parking) | [Drop Arm Optical Turnstiles](https://commons.wikimedia.org/wiki/File:Drop_Arm_Optical_Turnstiles.jpg)                                                                                                     | Fabtron    | Drop-arm optical turnstiles across a reception lobby beside the front desk.                     |

### Home previews the header (client decision, 25 Nov 2026)

The client approved a home page that previews the header menu, one section per item, in menu order. It extends the
premium pass with no new visual pattern: the shared `Section` grounds, `SectionHeader` with its end link, the
signature text link, `JourneySteps`, the night `ReachBand` and the existing cards.

| #   | Section                                     | Menu item | Ground | End link                     |
| --- | ------------------------------------------- | --------- | ------ | ---------------------------- |
| 1   | Hero (unchanged)                            |           | paper  |                              |
| 2   | Company figures, then the published reviews | About     | band   | Read the published reviews ↗ |
| 3   | Model-code ticker (unchanged)               |           |        |                              |
| 4   | Six product families                        | Products  | paper  | See all products             |
| 5   | Photo places, each tile to its solution     | Solutions | paper  | See all solutions            |
| 6   | Software                                    | Software  | night  | All software                 |
| 7   | How AIMS works: the five-step journey       | Services  | paper  | See services                 |
| 8   | Showroom, lines and the reach map           | Locations | night  | See locations                |
| 9   | Closing call                                |           | night  |                              |

- **Reviews.** `HomeReviews` is now the one reviews strip, used by the figures band and by `HomeProof` on /about; the
  review card reads in ink on light grounds and keeps its night tones on night green.
- **Places.** Photos, layout and scan reveal are unchanged; the tiles now open /solutions/entrance-parking (office
  towers, reception lobbies), /solutions/access-control (building entrances) and /solutions/door-locks (hotels).
- **Journey.** The pre-pass `HomeJourney` returned on `JourneySteps` with its five steps and copy. Its old pill
  ("Start with step one now" → /quote) did not return: the end link is the section's one action and the closing band
  asks for the quote. The closing band's one line of steps went, and with it `ClosePanel`'s unused `steps` prop.
- **Locations.** The showroom and offices section merged into the shared night `ReachBand` (now with an optional end
  link). The reach map is the page's dealt moment: it draws once when a third of the map is on screen
  (`MomentTrigger`, `trigger="map"`) and rests drawn under reduced motion; it has no loop. On a desktop it stands
  centred beside the taller showroom copy.
- **Grounds.** The reach map is drawn for night green (its labels are night text and lime), so section 8 is night.
  That gives two night bands mid-page, the software band and this one, parted by the light journey. Section 8 is
  followed by the night closing band; the system's existing rule parts two adjacent night bands with a hairline
  (`ui/sections.css`), as on /about, so they never read as one. Moving the close or the map onto light would have
  needed a new pattern.
- **Not returning:** buyer routes, the door teaser and the FAQ.

### Home journey timeline (client request, 25 Nov 2026)

The client found the home "How AIMS works" section too compact and asked for a richer process component, inspired by
two 21st.dev components: "Scroll animated timeline" by ibrandify and "Vertical How It Works Timeline" by ln-dev7. Only
the ideas were taken (a rail that fills with the scroll, step cards on dashed or solid rails); no code was copied. The
client then approved GSAP for it the same day (CLAUDE.md §3).

- **Place and ground unchanged.** `HomeJourney` stays the Services preview (`#journey`), on paper between the two night
  bands, with "See services" as the end link. It is split into `HomeJourney`, `JourneyCard`, `JourneyCounter` (server)
  and one client leaf, `JourneyMotion`, which lazy-loads `JourneyTimeline` and `journeyMotion.ts` after hydration.
  The shared `JourneySteps` is untouched.
- **Layout.** From 1024px the heading, lead, end link and a large Plex Mono counter ("01 / 05") take the start five
  of twelve columns; five step cards stand on a rail in the end seven. Below, one column with the rail on the start
  edge; the counter is hidden. Logical properties throughout, so Arabic mirrors.
- **Cards** are the one card (white, radius lg, plinth shadow): the step's numeral in mono, its existing icon, a
  display-face h3, the existing body, a "Who" tag, a "What's included" list of two points and, on steps one and five,
  a link (Request a quote → /quote, Read the warranty policy → /support). Nodes are the night disc with the lime tick.
- **Copy, only AIMS's own** (CLAUDE.md §1): owners and step one's first point from `services.process`; the quotation
  line from services step two; step two's points from the access control and time attendance plans; the export line
  and warranty sentence from `services.cover`; installation and setup merged from the two solutions' steps 2–4; the
  model count from the catalogue (`home.families.heading`, as the families header reads it). It says "models", not
  "ZKTeco models", because the catalogue also holds Alpha hardware. New keys are under `home.journey.*` in both
  languages; the Arabic reuses the source strings where they exist, and the rest is a draft for AIMS's reviewer.
- **Motion (GSAP).** The server renders the final frame (rail full, every node ticked, every card whole), which is
  what shows without JS and under reduced motion. From 1024px on a screen at least 640px tall, ScrollTrigger pins the
  section's content below the header and scrubs one timeline over 2.6 viewports: the list slides up a step at a time,
  the green-700 rail fills over its green-100 track (scaleY), each card rises from rest (40% opacity, 24px low) to
  active (whole, lifted to the plinth's second shadow through an opacity layer), each node's numeral gives way to a
  drawn lime tick (DrawSVG), the counter rolls its digits to the step, and the last node sends out one lime ring, the
  hero's verified tick at the journey's end. The pin never traps the scroll; keyboard focus on a card's link scrolls
  to the point where that card is active. Below 1024px: no pin, each card rises in once and the rail fills down the
  start edge with the scroll. SplitText (masked lines) replaces SplitWords on the heading, and the section opts out
  of the CSS scroll reveal (`Section moment`), so two systems never run on one element.
- **Dependencies: `gsap` and `@gsap/react`**, approved by the client for signature motion (free for commercial use,
  plugins included); loaded only in the journey's lazy chunk, about 50 KB gzipped after hydration. Home transfer at
  1440 measured 816 KB, at 390 577 KB; LCP unaffected (the hero image).
- **Tests.** `home.spec.ts` checks five cards with a Who tag and a two-to-three-point list each, the two links, the
  catalogue count and the aria-hidden counter, then the motion: at rest under reduced motion (no pin, rail full, all
  ticked), pinned and scrubbed on a desktop (rail part-filled mid-way, all whole at the end, focus brings the last
  link into view) and unpinned on a phone. GSAP tweens are not CSS animations, so the smoke test asks them to rest
  before axe (`html[data-motion-rest]` and the `aims:motion-rest` event revert them to the server-rendered frame).
- **Open.** Step one's second point repeats its body sentence in other words, as the brief mapped it; AIMS may prefer
  one of the two.

### Hero choreography with GSAP (client request, 25 Nov 2026)

The client asked for a more premium hero entrance in GSAP, staying B2B and on AIMS's domain: a ZKTeco terminal
verifying a person at a door. It replaces the verified frame's CSS keyframes, the border beam's CSS (`ui/beam.css`,
used only here) and the screen's WAAPI loop (`animateHeroScreen.ts`); decision 4's sequence and the approved screen
prototype are kept, now on one clock.

- **Loading.** `HeroAnimation` (the client leaf with the pause button) lazy-loads `HeroTimeline` after hydration with
  `next/dynamic`, exactly as `JourneyMotion` loads the journey; both chunks import GSAP from one entry,
  `motion/gsap.ts`, which registers the plugins once and holds the shared rest switch (`aims:motion-rest`).
- **One master timeline** (`heroMotion.ts`), from GSAP's first frame: the four brackets close in from 34% wider (expo
  out, 1.1s, 70ms apart); at 0.55s one lime scan line sweeps down (1.2s); at 0.6s the screen scans ("Look at the
  camera" → "Verifying…"), at 2.1s it turns to Welcome with its tick drawing (DrawSVG); at 2.25s the chip springs in
  (back out) and its tick draws; at 2.4s the beam runs round twice (2s) and fades. The frame stands by about 4.7s.
  After the prototype's 2.35s hold the screen loop starts at 4.9s: a child timeline with `repeat: -1` and the
  prototype's beats (450ms fades, scan 1.5s before verified, 5.8s a cycle). It pauses off-screen
  (IntersectionObserver), on `document.hidden` and by the keyboard-only button (WCAG 2.2.2).
- **Scroll exit.** From 1024px a scrubbed ScrollTrigger timeline opens the brackets 14% outward, eases the terminal
  to 0.96 and fades the chip as the hero leaves. Transform and opacity only; no text moves. Below 1024px there is no
  exit (it only shrank the device on a phone). Entrance and exit drive different elements (the bracket svg and its
  wrapper, the chip and its anchor), so two tweens never fight over one property.
- **RTL.** Each bracket is the top-left corner mirrored into place by CSS, so "outward" is (-x, -y) inside every
  corner; the Arabic mirrors swap and the motion follows with no per-language code.
- **No flash, LCP untouched.** The device photo (the LCP element) is painted whole at first render: its old fade-in
  is gone and it is never hidden. The server renders the verified frame, which no JS (`scripting: none`) and reduced
  motion keep; with scripts and motion the stage paints a pending frame (screen at idle, brackets and chip waiting)
  that equals the timeline's first, and `data-state` passes from `pending` to `animated` in the same frame. If the
  chunk fails to load, the verified frame is shown.
- **What stayed CSS: the text.** The headline's masked line rise, the badge, lead and trust fade and the model label
  stay CSS, as before. GSAP arrives after hydration, so a SplitText reveal would have to hide the text first (a
  flash, or a later LCP on phones, where the headline can be the largest element). The two lines stay unbroken from
  1024px (tested).
- **Reduced motion and rest.** `gsap.matchMedia` gives reduced motion its own handler: no timeline, no scrub, the
  verified frame. The e2e rest switch reverts everything to that frame before axe.
- **Tests.** GSAP writes inline styles, so the hero specs read computed styles and the art's `data-state` and
  `data-playing` (`tests/e2e/hero.ts`): rest under reduced motion (no inline styles, nothing moves, no scrub), the
  entrance's order and outward start and settling within 5s (recorded with a MutationObserver from the first paint),
  the loop's return to idle and next scan, pause off-screen and by keyboard, the drawn tick, and the exit (desktop:
  scale between 0.96 and 1, chip fading, brackets outward, headline scrolling exactly with the page; phone: none).

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

**Locations on the light band (client decision, 25 Nov 2026).** With the reach map on night green, the locations
section, the close and the footer made one long dark stretch, so the client asked for locations to go light.
`ReachBand` takes `ground="band"`: the light band, with the same map drawn in green (`.ui-reach-light` in
`signature/reach.css`: green-700 routes, cities and offices above 3:1 as graphics, labels in ink and ink-600, lime
only in the faint ring) and the showroom list in ink with green actions. Night green on home is now only the
software band and the close; the other pages keep the night reach band.

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
permission to link datasheets and software files, a photograph of the Deira showroom, and an Arabic reviewer. The
showroom photo has a ready slot (`SHOWROOM_PHOTO` in `src/lib/site.ts`): set it and the showroom card on `/contact`
and `/about` shows it. aimsuae.me publishes no showroom photo (checked 23 Nov 2026: product banners and stock images
only), and no stand-in is used. `ar.json` is a first draft and needs that
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
- The quote page uses the shared `wrap` grid.

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
  - the container lines: the container class is now `.wrap` as the skill expects, but the hero keeps a wider stage;
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
- **Taken onto `main` through `claude/purposeful-motion`, after review (23 Nov 2026):**
  - The new hero entrance (title rising from its mask, studio light behind the photo) is shared by every T3-based
    hero: all five solution pages, the location pages and the company pages. The branch had applied it to two
    hard-coded solution slugs only.
  - On phones, the door's parts list now follows the one-shot playback step by step; before, it stayed on "01" until
    the end.
  - The access control scroll story is excluded from the audit's one-screen section rule, which otherwise removed its
    scroll range.
  - `.taste-skill/waivers.json` is unchanged (the branch had swapped a waiver), the raw gate and performance outputs
    stay local (CLAUDE.md), and the resting hero glow keeps its original strength (DESIGN.md "Lime Is Light").
  - Scroll-driven stories are desktop only, on the homepage door, Access Control and Time Attendance. Phones play
    once; product, software and the other solution pages keep their one-time draws.

### Short-phone first screens (audit B4, 23 Nov 2026)

At 320×480 the homepage and software hub titles (5 and 7 lines) and the product photo (about 60% of the screen) left
no action on the first screen. Changes apply only to narrow, short screens; desktop and normal phones keep their
composition.

- **Homepage and software hub, ≤600px tall:** smaller titles (`--text-home-display-short`, `--text-page-title-short`)
  and tighter hero spacing. Their main action is in view at 320×480 and 320×568, English and Arabic.
- **Product pages, phones:** the quantity and Add to quote follow the model chip (CSS order). The summary and spec
  tiles they move past hold no focusable element, so keyboard order still matches what is seen; desktop keeps the
  source order. On screens ≤760px tall the photo frame is capped in height but keeps its full width, and the photo stays
  whole (`object-contain`). Under 360px wide, Add to quote takes its own row rather than wrapping its label.
- **Measured:** Add to quote is in the first screen at 320×568 (iPhone SE) and 390×664, English and Arabic. At the
  extreme 320×480 it sits one row below the fold. Squeezing further would shrink the photo to a thumbnail.
- `tests/e2e/short-phone.spec.ts` checks these first screens and the phone order.

### Proof band and band rhythm (client mockup B and instructions, 24 Nov 2026)

- **The proof follows the hero** (client instruction: AIMS's strongest trust signal belongs early). It is now night
  green after mockup B: the authorization badge (behind `ZKTECO_AUTHORIZATION_CONFIRMED`), one sentence carrying the
  four `COMPANY_FIGURES` as the section's h2, the existing company-stated note, three reasons (showroom, one team,
  Dubai and Abu Dhabi) and the three published reviews as night cards. The mockup's showroom line ("see terminals,
  locks and turnstiles working") and "one number to call" were not used: AIMS has not confirmed live demos and lists
  four numbers. The figure labels stay AIMS's published wording ("years of experience", not the mockup's "years
  trading", which would date the company before AIMS confirms a founding year).
- **The one count** (CLAUDE.md §3, tech): the four figures count up once (1.4 s, ease-out, 120 ms stagger) when 40%
  of the sentence is in view. The server HTML holds the final figures; screen readers read only an sr-only final
  value; reduced motion shows the final numbers with nothing moving. The digits box keeps the final width, so layout
  shift stays 0.
- **Two night bands on the homepage (client decision, 24 Nov 2026):** hero (paper) · proof (night) · routes (paper) ·
  families (light band with a green wash) · software (paper, added 24 Nov 2026) · door (paper) · reach (night) · journey (paper, added 24 Nov 2026) · FAQ (paper) · close (mint panel with a
  wash, on paper) · footer (showroom floor). The client found four dark bands too heavy: the dark share of the page
  height measured 44% before and 21% after. Only the proof and the reach (whose lime map routes need the dark ground)
  stay night. The families band now puts its product cut-outs on the white plinth cards with light-surface text and
  green-700 links, and the close uses the shared mint `ClosePanel` with the green-700 primary button; the night
  closing tone, the lime button and the closing band's glows were then unused and were removed.
- **Light gradient sections (client decision, 24 Nov 2026, after NUZON's light washes, in AIMS's own palette):** the
  families band carries `--gradient-families-wash` (a soft green-100 light from the top start corner, a faint lime
  tint at the bottom end, over a green-50 to paper-2 base) between its hairlines, and the closing mint panel carries
  `--gradient-close-wash` (a faint lime light at its top end, green-100 at its bottom start, on green-50). The close's
  section stays plain paper so it meets the FAQ on a clean edge. Text keeps 4.5:1 or more at every point of both
  washes (globals.css). No silk-ribbon artwork, no NUZON colours. **Later removed (24 Nov 2026):** once every light
  surface shared one mint, the client found the washes added unevenness rather than character; both bands are now
  flat mint and the gradient tokens are deleted.
- **A full gradient per band, clean edges (overrides DESIGN.md "no gradients as decoration on light surfaces", by the
  client's instruction):** a first version faded each night band into its light neighbour; the client found those
  fading edges hard on the eyes and asked for each band to carry its own gradient instead, with no shadow at the joins.
  On the homepage (`main.home-bands`) night bands keep the night-green gradient with a soft lime light at their top
  edge (night-muted keeps 5.4:1 or more over it), and paper sections carry a faint mint wash from the top end corner
  (`--gradient-paper-wash`). Bands meet on a clean edge. Where two night bands meet elsewhere (the about page's proof
  and reach) a night hairline parts them.
