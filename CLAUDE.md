# CLAUDE.md — AIMS website, redesign branches

@AGENTS.md

This file is for the redesign branches (`claude/direction-2-step-inside`, `claude/direction-3-families`,
`claude/hero-options`). It is **not** the `main` branch's CLAUDE.md, and the old design rules from `main` do not apply
here (client decision, 27 Nov 2026). Only the project's source of truth and technical rules below apply.

## What this project is

A redesign of **aimsuae.me** for **AIMS Security Systems Trading LLC**, a ZKTeco distributor and installer in Dubai
and Abu Dhabi (access control, time attendance, entrance control, locks, POS). It is a hiring assignment: build AIMS a
site that is clearly better than its competitor NUZON (nuzon.me). AIMS is the client. NUZON is only a benchmark;
never copy its brand, copy or assets.

The team chose two new directions for a completely different look from `main`. Read `docs/handoff/HANDOFF.md` first:
it describes both directions and the work.

## Design rules: yours to write

There are **no inherited design rules** on these branches. The old Design Doc styling, the design-taste-frontend
skill's house rules, the token and motion limits and the design gate from `main` are all set aside. Choose the design
rules that serve your branch's direction, using `docs/handoff/HANDOFF.md`, the preview pages and the MotionSites
skill it names, then **write them into this file** under a new `## Design rules` heading: palette and tokens, type,
layout, components, imagery, motion and scroll engine. Show them to the owner with your first mockups and get
approval before building on them. From then on, follow the rules you wrote.

## Design rules

Direction 2, **Step inside the terminal** (branch `claude/direction-2-step-inside`), built from the MotionSites
"Laptop Portfolio" design and the `/preview/step-inside` exploration. Written 27 Nov 2026; **draft until the owner
approves them with the first mockups** (`docs/mockups/direction-2/`). Once approved, follow them on every page.

### Idea

Every main page is a **stage**: one real AIMS product, cut out, stands in front of one giant word. On the home page
only, scrolling flies the product at you until its screen fills the view and the content opens out of that screen;
every other stage stands still and its content follows it (owner review, 28 Nov 2026). Facts sit on cream
**tickets** (mono rows, dashed dividers, punched notches). Everything else is calm: dark night-green stages,
cream paper sections between them, one lime accent.

### Palette and tokens (`src/app/globals.css` → `@theme`; components use tokens only, no raw hex)

| Token                    | Value                                   | Use                                                           |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------- |
| `--color-stage-950`      | `#08130d`                               | footer, model strip, deepest ground                           |
| `--color-stage-900`      | `#0b1d14`                               | night sections, stage edge                                    |
| `--color-stage-800`      | `#143826`                               | stage middle                                                  |
| `--color-stage-600`      | `#24603f`                               | stage glow (centre of the radial)                             |
| `--color-ticket`         | `#f5f1e8`                               | ticket cards **and** the paper section ground                 |
| `--color-ticket-ink`     | `#0f1f17`                               | text on ticket and paper, dark pill                           |
| `--color-ticket-line`    | `rgb(15 31 23 / 0.22)`                  | dashed dividers on ticket and paper (decorative)              |
| `--color-word`           | `#f3f8f4`                               | the giant word                                                |
| `--color-lime`           | `#78be20`                               | the one accent, **on dark grounds only** (≥ 7:1 on stage-900) |
| `--color-green-700`      | `#26703a`                               | the accent on paper (lime fails contrast on cream)            |
| `--color-night-muted`    | `#a9bdb0`                               | body text on night                                            |
| `--color-family-*` (six) | the six family grounds from the handoff | glow behind a family's product inside the screen              |

- **Stage** = `radial-gradient(70% 80% at 50% 38%, stage-600, stage-800 45%, stage-900)` under the **white header**.
- **Rhythm:** night stage → paper → night → paper…, never two paper sections touching. The header stays white.
- No violet, no gradients on text, no glass blur, no glows other than the stage radial and the soft product shadow.

### Type (fonts only from `src/app/fonts.ts`)

- **Giant word:** Archivo 900, `font-stretch: 125%`, tracking −0.045em, line-height 0.8, uppercase,
  `min(30vw, 27rem)` on a stage. One per stage, `aria-hidden` (the real heading is the H1/H2).
- **Headings:** Archivo 750, stretch 112%, tracking −0.025em. H1 2.25rem (1.75rem phone); H2 3.25rem (2.1rem phone).
- **Figures:** Archivo 900, stretch 125%, `tabular-nums`; the `+` in green-700/lime at half size.
- **Body:** Inter 16–18px, line-height 1.55. **Labels, ticket rows, counters, model codes:** IBM Plex Mono 13px,
  uppercase, tracking 0.06em. Sentence case everywhere else.
- **The claim pill:** Archivo 700 italic, lime on ticket-ink, rotated −3°. Only "Authorized ZKTeco Distributor · UAE"
  (behind `ZKTECO_AUTHORIZATION_CONFIRMED`).

### Layout

- Each section is **one screen** at 1440×900 (stages fill the viewport under the header); content edges match the header and footer
  (`.wrap`: the page gutter inside the 1344px container), equal on both sides; text columns ≤ 34rem.
- Stage composition: word top, product centre (bottom-anchored), H1 + lead + two actions bottom-start; the scroll cue
  bottom-end on the home hero only. Phone: word top, product middle, copy bottom, no cue, no lanyard.
- Inside a screen: ticket start column, product end column, line + pill under the ticket, round arrows top-end,
  word chips bottom-end, a thin lime progress line along the bottom.
- RTL mirrors every column with logical properties.

### Components (one of each)

- **Pill button** (primary): white on night / ticket-ink on paper, 48px tall, a 36px dark circle with a lime arrow.
- **Outline button** (secondary, `.in-link`; `.home-secondary` on older pages): a pill like the header's Quote button,
  48px tall, 1.5px lime outline and lime text on night, green-700 outline and text on paper. Never an underlined line
  (owner review, 28 Nov 2026). Underlines are for links inside sentences only.
- **Round arrow** (48px circle, 1.5px border) for prev/next; **word chip** (44px tall, active = lime fill).
- **Ticket card**: cream, radius 1rem, punched notches via mask, title in Archivo 800, mono rows with dashed tops.
  Used for every spec, fact and step panel.
- **Lanyard pass**: the hero's access card and the "Visitor" pass on Locations. **Screen frame**: radius 14px,
  1px light outline, for the few photographs and for software lists.
- **Counter** "01 / 06" (mono, lime) and **scroll cue** (circle + mono text).
- **Family tabs** (one row of pills, count in mono): the six families plus All above every product list. On
  `/products` they filter the list in place (`?family=`); on a family page they link to the other family pages.
  Product cards on paper are white with a dashed divider under the photograph.
- **Shared cards** (`.ui-card`, via `.d2` + `src/components/inside/skin.css`): no shadow, no green tint; white with the
  ticket hairline on cream, cream on a white band, a screen frame on night. Icon tiles are outlined ink rounds;
  counts and kinds in mono. The closing band stands on the stage's ground.
- Cards don't nest more than two deep; one radius scale (8, 14, 16px, pill).

### Imagery

- **AIMS's own product photographs, cut out** (`public/images/cutouts/`, lifted with Apple Vision and cleaned with
  `docs/handoff/lift/`; `docs/handoff/cutout.py` only as a fallback), checked on a dark ground for white fringes, big
  and whole (never cut by the stage's edge or zoomed into), a different product on every stage. Shadow is a separate soft
  layer, never a filter on a moving product.
- Licensed **stand-in photographs** only for places (Solutions), only inside screen frames, credited in the footer
  line and listed in README → Decisions; never shown as AIMS premises, staff or customers.
- No icons drawn as fake logos, no emoji, no stock people.

### Motion and scroll engine

- **Engine:** GSAP ScrollTrigger (pin, scrub, snap; `src/components/motion/gsap.ts`) driven by **Lenis** for smooth
  wheel scrolling (`lenis.on("scroll", ScrollTrigger.update)`, GSAP's ticker drives `lenis.raf`, lerp ≈ 0.1). Lenis
  runs only on fine pointers; touch keeps native scroll. No other scroll library. Loaded lazily in the smallest client
  leaf, never in a layout; cleaned up on unmount (`useGSAP`).
- **Only the home hero dives** (owner review, 28 Nov 2026): the stage pins, the product flies forward (zoom in log
  space, eased ends) until its screen fills the height, then the content opens out of the screen with
  `clip-path: inset()`. At most **one more** pinned, scrubbed sequence on home (the job ticket). Pins never trap the
  scroll; snapping is soft (to each item in a scrubbed list, ≤ 0.6 s, `power2.inOut`).
- **Product-led pages** (product detail, each solution, each software platform, the ZKTeco location pages) open on a
  **still stage** (`PageStage`): no pin and no scrub; the page's first panel (the ticket of facts) follows it in the
  flow. **Pages for choosing** (the products hub, the six families, the Solutions and Software hubs) have **no stage**:
  a short head (`src/components/inside/PageHead.tsx`: crumbs, H1, one line) and the choices on the first screen
  (client decision, 28 Nov 2026: no step between a click and what the visitor came for). Company pages (services,
  about, locations) open on a **word stage** (`src/components/word-stage/`): there is no product, so their facts sit
  on a ticket. Form pages (contact, quote) use the compact word stage **without the word**, so the form starts on
  the first screen.
- **Everything else** reveals as it scrolls into view: blocks rise 24px and fade; photographs open from a small
  rounded screen to full (`clip-path`), scrubbed.
- **Entrance on load, once (~1.2 s):** the word rises out of its baseline, the product rises, the lanyard drops and
  settles, the copy fades up. Then only two loops: the card's sway and the scan line on the device screen, both paused
  off-screen.
- **Hover/press:** pill steps up 1px and its arrow slides 3px; round arrows scale 1.06; screen frames zoom their
  photo 1.03; outline buttons step up 1px and take a lime (or green-50) wash.
- Animate **transform, opacity and clip-path only**. Easings: `--ease-out` `cubic-bezier(.2,.8,.2,1)`,
  `--ease-stage` `cubic-bezier(.65,0,.35,1)`.
- **A photograph still on studio white** (product detail, software) stands on a cream **plate** and multiplies onto
  it.
- The home dive runs only at ≥ 1024 × 600 with motion allowed and scripting on; below that its stage and what opens
  inside it stack.
- **Reduced motion:** no Lenis, no pins, no scrub; every final state shown, the home stage stacked (stage, then what
  opens inside it). Content is in the DOM and readable without JavaScript.

## Sources of truth

| Question                                                      | Source                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Company facts: name, phones, addresses, figures, claims flags | `src/lib/site.ts`                                                       |
| Products, software, families                                  | `content/*.json`, `src/content/` (taxonomy, catalogue)                  |
| Product truth: users, positioning, open facts                 | `PRODUCT.md`                                                            |
| Scope, routes, architecture, acceptance tests                 | `docs/master-plan-v2.0.pdf` (ch. 12 sitemap, 16 architecture, 18 tests) |
| The two directions and the task                               | `docs/handoff/HANDOFF.md`                                               |

If these sources conflict, or are silent on something that matters, **stop and ask** the owner.

## Commands

```bash
pnpm dev                  # http://localhost:3000
pnpm build                # production build (required before e2e)
pnpm check                # lint + typecheck + unit tests: run before every commit
pnpm e2e                  # Playwright smoke + axe, desktop and mobile
pnpm format               # Prettier + Tailwind class order
pnpm import:content       # re-import catalogue from aimsuae.me (rarely; review the diff)
```

Node 22, pnpm 10. Don't use npm or yarn, and don't commit another lockfile.

## Architecture map

```
content/*.json            generated by scripts/import-aims.ts. Never hand-edit; fix the importer.
src/app/[lang]/           all pages; root layout lives here (en unprefixed, ar under /ar)
src/app/global-not-found  404 for unmatched URLs
src/components/shell/     header, footer, menus
src/components/           shared UI (one component per file, PascalCase)
src/content/              schema.ts (Zod), taxonomy.ts (6 families), catalogue.ts (typed accessors)
src/i18n/                 config, dictionaries, messages/en.json + ar.json
src/lib/routes.ts         route registry: the 35 designed routes + status
src/lib/redirects.ts      301 map from old aimsuae.me URLs
src/lib/nav.ts            navigation model shared by header, menu, footer
src/lib/site.ts           site URL, indexing flag, contact details, claims flags
src/proxy.ts              locale routing (Next 16 "proxy", formerly middleware)
tests/e2e/                Playwright specs
```

## Non-negotiables

These are about truth, access and the site working, not about how it looks.

### 1. Truth and content (source of truth)

- **Never invent** specifications, prices, stock levels, statistics, testimonials, clients, partnerships, certifications
  or opening hours. Product data comes only from `content/*.json`; company facts only from `src/lib/site.ts`.
- Follow the **claims policy** (Design Doc 3.1). "Authorized ZKTeco Distributor" stays behind
  `ZKTECO_AUTHORIZATION_CONFIRMED`. Company figures (years, installations, clients) must be flagged as company-stated.
  Don't show a founding year until AIMS confirms it.
- Missing data is shown honestly (for example "Specs on request" or a datasheet link), never filled with placeholders
  that look real.
- Anything that only simulates (quote submission, downloads) must be labelled as a demo in the preview (Plan ch. 16).

### 2. Accessibility: WCAG 2.2 AA, built in

- **0 axe violations** on every built route at both viewports (enforced in `tests/e2e/smoke.spec.ts`).
- Each page has one `<h1>` and headings in order. Use landmarks (`header`, `nav` with a label, `main#main`, `footer`).
  The skip link must keep working.
- Everything works by keyboard, focus is always visible, and focus moves sensibly (dialogs trap and return focus,
  error summaries take focus).
- Touch targets are at least 44 × 44 px. Pinch-zoom is never disabled. The layout reflows at 320 px and at 400 % zoom
  with no horizontal scroll.
- Prefer native elements (`button`, `a`, `dialog`, `details`, `form`, `label`) over ARIA. Disclosure menus are
  buttons with `aria-expanded`, not ARIA `menu`.
- Form fields have visible labels. Errors are in text, linked with `aria-describedby`, and marked with
  `aria-invalid`. Live counts use `aria-live`.
- Every meaningful image has `alt`, and decorative images have `alt=""` / `aria-hidden`. Icon-only buttons have an
  accessible name.

### 3. Performance (Plan AT-11)

- Throttled mobile: **LCP ≤ 2.5 s, CLS ≤ 0.05, home transfer ≤ 1 MB.**
- Use Server Components by default. Add `"use client"` only to the smallest interactive leaf, never to a page or a
  layout.
- Use `next/image` with explicit `width`/`height` (or `fill` plus sized parent) and `sizes`. Only the LCP image gets
  `priority`. No layout shift from images, fonts or late UI.
- Fonts come only from `src/app/fonts.ts` (self-hosted). Never use Google Fonts or other runtime CDNs.
- No new runtime dependency without a one-line justification in the PR. Prefer the platform and small utilities.
- The site never calls aimsuae.me or any third party at runtime (no trackers in the preview).

### 4. SEO and URLs (Plan ch. 12, AT-12, AT-13)

- Existing product, software and location URLs **never change**. New routes come from `src/lib/routes.ts`.
- Every old URL that changes needs a 301 in `src/lib/redirects.ts`, with no chains, and tests must stay green.
- Each page has a unique title of 60 characters or fewer via `generateMetadata`, a self-canonical, one H1, and
  JSON-LD where the plan requires it (Product, Organization, BreadcrumbList).
- Previews stay **noindex**. Only production at launch sets `SITE_INDEXABLE=true`.
- Navigation links only to built routes, valid filtered states (`/products?q=…`) or clearly external links.

### 5. Internationalisation and RTL

- **No hard-coded UI strings** in components. Add keys to `src/i18n/messages/en.json` **and** `ar.json` (a test
  enforces the same keys). Product data stays English unless AIMS supplies translations.
- Use **logical properties only**: `ms-/me-/ps-/pe-/start-/end-`, `text-start`. Never use `ml-/mr-/pl-/pr-/left-/right-`
  for layout. Mirror directional icons with `rtl:-scale-x-100`.
- Phone numbers, model codes and the wordmark stay LTR (`dir="ltr"`) inside RTL text.
- Build links with `localePath(locale, path)`. Never hand-build `/ar/...` strings.
- Arabic copy is a draft until AIMS's reviewer approves it (Design Doc ch. 17).

### 6. Code quality

- **TypeScript strict. Use no `any`, no `@ts-ignore`, and no non-null `!` without a comment saying why it is safe.**
- Validate data at boundaries with Zod (imports, forms, URL params, localStorage). Inside the app, trust the types.
- Keep components small and single-purpose. Above about 150 lines, or with more than one reason to change, split it.
  Name components in PascalCase, everything else in camelCase, and route folders in kebab-case.
- Pure logic (formatters, reducers, search, the WhatsApp message builder) lives in `src/lib/` as plain functions with
  unit tests next to them (`*.test.ts`).
- Keep state as low as possible. Filter, search and sort state lives in the URL. The quote list lives in one store
  (`aims.quote.v1`, 14-day TTL). Don't scatter `useState` copies of the same data.
- No dead code, commented-out code, `console.log` or unused exports in commits. No TODOs without an owner and a reason.
- Comments explain **why**, not what. Reference the doc rule you are implementing, for example
  `// Design Doc 6: no floating button in the first screen`.
- Don't use the `<a>` element for internal links (use `next/link`). Don't use `dangerouslySetInnerHTML`; content
  arrives as structured blocks. The one exception is `src/components/JsonLd.tsx`, which escapes `<`.
- Errors are handled where they can be handled. User-facing failures show a helpful message and a way forward.
- Don't hand-edit generated files (`content/*.json`, `next-env.d.ts`, `.next/`).

### 7. Next.js 16 specifics (see `AGENTS.md`: read `node_modules/next/dist/docs/` first)

- Use `src/proxy.ts`, not `middleware.ts`.
- `cacheComponents` is on. Don't use bare `new Date()` / `Math.random()` in server render; use `"use cache"` or a
  client component. A `usePathname`/`useSearchParams` caller may need a `<Suspense>` boundary.
- The locale comes from `getLocale()` / `getDictionary()` (`next/root-params`), not prop-drilled.
- Because of the proxy rewrite, read the browser path on the client after hydration (see `LanguageSwitch.tsx`).
- Redirects use `statusCode: 301` (not `permanent: true`, which sends 308).

### 8. Done means

- `pnpm check` and `pnpm build` pass; `pnpm e2e` passes, or any failure is a test written for the old design, which
  you update to the new design and say so (never skip or weaken a test to go green).
- Checked at 390 px and 1440 px, in English and Arabic, and with keyboard only.
- Deliberate decisions are recorded in `README.md` → Decisions.

## Git

- Work on your direction's branch and push there. Don't merge into `main` or open a PR unless the owner asks.
- Imperative commit messages with a short subject and a body saying what and why.
- Never commit secrets, `.env*` (except `.env.example`), `.cache/` or build output. Never force-push.

## Open questions waiting on AIMS (don't guess)

Logo · founding year (2011 or 2014) · opening hours · which phone serves which need · permission to link datasheets
and software files · Arabic reviewer. (Resolved 21 Nov 2026: the ZKTeco authorization and its wording "Authorized
ZKTeco Distributor · UAE", and the four company figures in `src/lib/site.ts`.) Data issues from the import are in
`content/import-report.json` and `README.md`.
