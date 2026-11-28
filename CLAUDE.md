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

Direction 3, **Product family slider** (branch `claude/direction-3-families`), built from the MotionSites "Smoothie
Slider" design. Status: **approved by the owner with the home mockups, 27 Nov 2026**.

**The idea in one line:** every product family owns a colour, a word and a real product. Pages are built from
full-bleed colour floods with one giant white word, AIMS's own cut-out product in front of it, and real accessories
floating around it. Scrolling moves you from one flood to the next.

### Palette and tokens

- **Six family grounds** (tokens in `globals.css` `@theme`, used for that family wherever it appears: hero, family
  page, product page, tiles, solution page): `--color-ground-access #0f1f17` · `--color-ground-time #26703a` ·
  `--color-ground-entry #2c5a4d` · `--color-ground-locks #4b5a34` · `--color-ground-parts #32453c` ·
  `--color-ground-pos #1d3b31`. White text passes AA on all six (lowest: time, 6.1:1).
- **Chalk** `--color-chalk #f1efe8` is the light reading ground (warm, not white), with `--color-chalk-line #d8d4c8`
  hairlines and white `#fff` cards on it. **Ink** `#0e1512` text, `--color-ink-600` secondary.
- **Night** `#08130d` for the footer only.
- **Lime** `--color-signal #a6d65a`: the one accent. Small doses only, and only on dark grounds (access, pos, night,
  parts): the wordmark dot, step numbers, the active counter, the dot inside the primary button. Never on chalk, and
  on the time green only at display size (the 64px step numbers: 3.6:1, which passes for large text).
- Pages alternate floods and chalk; never two identical grounds touching.
- No gradients on grounds, no glows, no glass except the frosted tab bar and the "Shown" chip that sit over moving
  product.

### Type

- **The giant word:** Archivo 900, `font-stretch: 125%`, uppercase, tracking −0.035em, line-height 1, pure white. One
  per flood section at most, sized to fit (never clipped, never wider than the frame). The width of each word is
  measured once and stored with the word, so CSS can size it without a script. Arabic pages keep the Latin word
  (it is the product family's name as a mark) and set the real heading in Arabic beside it.
- **Headings:** Archivo 800 at 112% width, tracking −0.035em, sentence case. h1 on stage 27–30px (the stage is the
  product's moment, the headline stays quiet); h2 56px desktop / 36px phone; card titles Archivo 700 at 108%.
- **Labels:** Inter 700, 12–13px, uppercase, tracking 0.22–0.3em (family name, "See the range", kickers).
- **Body:** Inter 16–18px, line-height 1.55. Inputs never below 16px.
- **Model codes, counts and phone numbers:** IBM Plex Mono, `tabular-nums`, LTR inside Arabic.

### Layout

- **The stage:** a 1440 × 900 design frame scaled to fit (`--u = min(100vw/1440, 100svh/900)`), centred, the ground
  filling the rest. On phones the frame is scaled to the width (`100vw/600`) so the product and the middle of the word
  fill the screen. Everything in the frame is positioned in `--u` units.
- **Stage UI** sits on the viewport edges in rem, never in `--u`: header row on top (transparent over the stage),
  frosted tab bar under it, headline and "01 / 06" counter top-left, "Shown" chip bottom-left, "See the range"
  bottom-centre, circle arrows bottom corners naming the previous and next word. Nothing overlaps the giant word's
  band except the product and the floating pieces.
- **Reading sections:** chalk or a family ground, 128px vertical padding (88px on phones), content in the one `wrap`
  (1344px max, 48px gutters, 20px on phones). Heading block = kicker, h2, optional lead on the left; one text link on
  the right.
- Equal left and right edges. Mobile first: on a phone remove, don't shrink (the tab bar, the family line and the
  blurred corner pieces go).

### Components

- **Primary button:** a white pill (48px) with ink text and an ink circle holding a lime arrow; on chalk the same pill
  inverted (ink pill, lime circle). **Secondary:** an uppercase tracked text link with a 1.5px underline. That is the
  whole button set.
- **Tab bar:** frosted pill (`rgb(0 0 0 / .2)` + blur), active tab white with ink text. Tabs are buttons that jump
  the scroll to their family.
- **Circle arrow:** 52px (48px on phones), 1.5px white ring, fills white on hover; its label names the next family.
- **Family tile:** the family ground, rounded 26px, the word sized to the tile, the product cut-out in front with its
  ellipse shadow, name + mono model count at the bottom, circle arrow. Every tile links to its family page.
- **Product card (catalogue lists):** the same tile at a smaller size, model code in mono, a brand line, the facts the
  catalogue states and nothing else.
- **Glass panel** on a flood: `rgb(255 255 255 / .07)` fill, 1px `rgb(255 255 255 / .14)` hairline, 24px radius.
- **White card** on chalk: 22px radius, no shadow.
- Hover: cards lift 2px and their product lifts a further 6px; buttons step 1px; underlines draw; 150–250ms.

### Imagery

- **Only AIMS's own product photographs**, cut out of their white studio backgrounds into `public/images/cutouts/`
  with `docs/handoff/cutout.py`, then cleaned (stray fragments, mirror floors) and checked on a dark ground. No stock
  photographs of places or people on this branch: a place is shown by the product that goes there.
- Each flood shows one hero product (big, whole) and four to six real accessories at different depths; two corner
  pieces are large and blurred. Every product shown is one in `content/products.json`, and the "Shown" chip links to it.
- Soft ellipse shadow under every hero product. The product never bobs; only the pieces float.
- Software appears as AIMS's own software images on white cards (they are light marketing images).

### Motion and scroll engine

- **Engine:** GSAP ScrollTrigger (pin, scrub, snap) and **Lenis** for smooth wheel scrolling, driven from one GSAP
  ticker so the two never fight. Lenis runs only on fine pointers (mouse, trackpad); touch screens keep native scroll
  with ScrollTrigger's scrub smoothing. Loaded lazily in the smallest client leaf, never in a layout.
- **The family slider (home hero; the same engine for any other pinned family sequence):** the section pins; each of
  the six families owns one stretch of scroll (about 70vh), split into a short rest (about 6%) and a change (the
  rest). During a change, scrubbed by the scroll: the old family is covered from its right edge to the left
  (`clip-path: inset()` on a nearly even curve with a little ease at both ends, so every bit of scroll shows about the
  same amount of change) while its layers drift left by 14% of the frame; the new family's layers arrive from the
  right with parallax (word 0.40, shadow 0.30, product 0.15, pieces 0.55, corner pieces 0.75 of the frame width),
  starting just after the wipe and easing out, deeper pieces travelling further. Order: access control, time
  attendance, entrance & parking, locks, door hardware, POS; after POS the page carries on. (Retuned for response by
  the owner's review, 28 Nov 2026: the reference's timed curve and long rest felt dead under the hand.)
- **One family per gesture:** a wheel or trackpad gesture (input with no pause over 200ms, a trackpad's glide
  included) moves the slider one family at most, whatever its size; the rest of the gesture is dropped. Resting on a
  family it may reach the one before or after; on the last family it carries on into the page, and coming back from
  the page it stops on the last family. A gesture that starts during a settle counts from where the settle is going,
  so slow notches each move one family. Steady input with no pause (a new trackpad stroke, a wheel still turning, told
  from a dying glide by its speed holding or rising) moves on one family every 0.65s. (Owner, 28 Nov 2026: a slightly
  bigger scroll ran through two families; then steady scrolling with the cursor still stopped the slider.)
- **Settle:** only once the wheel has been still for 280ms (250ms for native scroll), and in the direction the visitor
  was scrolling: 8% into a change carries on to the next family, anything less returns; scrolling back needs the same
  8% the other way; keyboard or scrollbar goes to the nearer side. The settle takes 0.25–0.6s, scaled by distance,
  `inOutCubic`. Lenis follows the wheel with `lerp 0.12` (firm, short tail). Touch snap: 0.3–0.6s after 0.2s.
- Tabs, arrows and ← → jump the scroll to a family (Lenis `scrollTo`, 1.1s `inOutCubic`, and no settle runs during
  a jump), so the URL and the scroll position always agree with what is shown.
- **Between changes:** pieces float (±7px, ±3°, 3.2–5s, out of step) and drift with the pointer by depth on fine
  pointers. Nothing runs on a timer; no autoplay.
- **Entrance:** on load the first family's layers arrive with the same parallax (900ms), then the UI rises in order
  (header, tabs, headline, chip, range link, arrows).
- **Reading sections:** headings rise once as they enter (24px, 600ms); a flood section's word slides in with a light
  scrubbed parallax. No other scroll effects; one pinned sequence per page.
- **Properties:** transform, opacity and `clip-path` only. No blur or filter animation on moving pieces (blur is
  static on the corner pieces).
- **Reduced motion:** no pin, no Lenis, no float: the six families stack as six static full-screen floods, every
  family visible. Everything rests at its final state.
- **Access:** the family switcher is a labelled `nav` of native buttons (`aria-current`, `aria-controls`), not an ARIA
  tab list: the buttons move the scroll rather than swap panels. Every family stays in the DOM as its own region with
  an h2; screen readers get every family's name, line, model and range link; hidden families are `inert`, so focus
  never lands on something hidden.

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
