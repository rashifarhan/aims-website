# CLAUDE.md — AIMS website

@AGENTS.md

## What this project is

A redesign of **aimsuae.me** for **AIMS Security Systems Trading LLC**, a ZKTeco distributor and installer in Dubai
and Abu Dhabi (access control, time attendance, entrance control, locks, POS). It is a hiring assignment: build AIMS a
site that is clearly better than its competitor NUZON (nuzon.me). AIMS is the client. NUZON is only a benchmark;
never copy its brand, copy or assets.

## Sources of truth: read before you build

Two documents in `docs/` define this project. Read the relevant pages **before** starting any page, component or
flow, and cite the chapter in your plan or PR description. Claude Code can read a PDF by page range, so read only
the pages you need.

| Question                                                | Document                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| **What** to build, for whom, why, scope, acceptance     | `docs/master-plan-v2.0.pdf` (Master Plan, 33 pp)                |
| **How** it looks, moves, reads and behaves              | `docs/design-doc-v0.1.pdf` (Design Doc, 26 pp)                  |
| Reference implementations of the approved animations    | `docs/prototypes/` (open the HTML in a browser)                 |
| Product truth: users, positioning, evidence, open facts | `PRODUCT.md` (Impeccable `init`, 21 Nov 2026)                   |
| The current visual system: tokens and components        | `DESIGN.md` + `.impeccable/design.json` (Impeccable `document`) |
| **Design principles: layout, motion, imagery, copy**    | **`.agents/skills/design-taste-frontend/`** (tasteskill 2.5.1)  |

**The design skill.** Every page is designed and checked with the `design-taste-frontend` skill (invoke it as
`/design-taste-frontend`; read its `SKILL.md` and the references it names before building). For AIMS:

- **Kind:** page type `product`, site-kind `tech`, kind `tech`. AIMS sells, installs and supports ZKTeco hardware
  (terminals, readers, locks, turnstiles), so the hardware row of the skill's table applies: AIMS's own product
  photographs lead, and tech grounds, loops, one count and one effect are allowed.
- **The brief is this repository:** company facts in `src/lib/site.ts`, products and software in `content/*.json`,
  open questions below. Under the skill's own copy rules ("Phone: none, unless the brief gives one"), AIMS's
  published phone lines, WhatsApp, showroom address and map link are brief-given and stay real. Never replace AIMS's
  own contacts with `.example` stand-ins.

### Master Plan v2.0: chapter → page

| Ch. | Topic                                        | Page |
| --- | -------------------------------------------- | ---- |
| 01  | Use case (what we are building and why)      | 3    |
| 06  | Customer profiles (6 personas)               | 9    |
| 07  | Audit of aimsuae.me (defects A01–A21)        | 10   |
| 09  | Customer journeys                            | 17   |
| 11  | Improvement matrix                           | 20   |
| 12  | **Sitemap & scope: 35 routes, 10 templates** | 21   |
| 13  | Visual direction & design system (summary)   | 24   |
| 14  | Template blueprints                          | 26   |
| 15  | Differentiating features                     | 27   |
| 16  | **Technical architecture**                   | 28   |
| 17  | Roadmap                                      | 29   |
| 18  | **QA & acceptance tests AT-01 … AT-14**      | 30   |
| 19  | Risks & scope control                        | 31   |
| 21  | Sources, assumptions, open questions         | 33   |

### Design Doc v0.1: chapter → page

| Ch. | Topic                                            | Page |
| --- | ------------------------------------------------ | ---- |
| 02  | **Six design principles**                        | 4    |
| 03  | Brand, wordmark, signal lines, **claims policy** | 5    |
| 04  | Colour (tokens, contrast, usage)                 | 6    |
| 05  | Typography (scale, rules)                        | 7    |
| 06  | Layout, grid, navigation, sticky rules           | 8    |
| 07  | Imagery, icons, illustration                     | 9    |
| 08  | **Motion system** + domain animations            | 10   |
| 09  | **Components (28): anatomy, states, a11y**       | 13   |
| 10  | Page designs (10 templates)                      | 15   |
| 11  | Key flows & states                               | 20   |
| 12  | Content design (microcopy)                       | 21   |
| 13  | Arabic & RTL                                     | 22   |
| 14  | **Accessibility specification**                  | 23   |
| 15  | Data the design depends on                       | 24   |
| 16  | Design handoff (token and component names)       | 25   |
| 17  | Open questions                                   | 26   |

### When sources disagree

1. The user's explicit instruction in the current session wins.
2. **Truth (§1), accessibility (§4), performance (§5) and SEO/URLs (§6) below** are never traded away for a design
   rule, whichever source it comes from.
3. **The design skill** wins on layout, composition, motion, imagery, copy style and the finish checks (decided by
   the client on 21 Nov 2026, for "more proven design principles").
4. **Design Doc** wins on AIMS's brand specifics the skill leaves to the client: palette and tokens, wordmark,
   claims policy (3.1), Arabic and RTL (13), component anatomy and states (9), and the approved prototypes.
5. **Master Plan** wins on scope, routes, architecture and acceptance criteria (AT-01 … AT-14).
6. If sources conflict in a way this order doesn't settle, or are silent on something that matters, **stop and ask**.
   Don't pick silently. If you deviate deliberately, say so in the commit message and in `README.md` → Decisions.

## Commands

```bash
pnpm dev                  # http://localhost:3000
pnpm build                # production build (required before e2e)
pnpm check                # lint + typecheck + unit tests: run before every commit
pnpm e2e                  # Playwright smoke + axe, desktop and mobile
pnpm format               # Prettier + Tailwind class order
pnpm import:content       # re-import catalogue from aimsuae.me (rarely; review the diff)
```

Design skill checks, run against the production server (`pnpm build && pnpm start`), one at a time:

```bash
node .agents/skills/design-taste-frontend/scripts/copy-lint.mjs <page.md or built html> --kind tech
node .agents/skills/design-taste-frontend/scripts/gate.mjs --start http://localhost:3000/ --kind tech --category "ZKTeco access control and time attendance" --primary "Request a quote"
node .agents/skills/design-taste-frontend/scripts/gate.mjs http://localhost:3000/
```

The gate writes to `.taste-skill/`. Commit `.taste-skill/waivers.json` (every waiver with its reason); the rest is
local output.

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

Treat each rule below as a requirement. Breaking one means the work isn't done.

### 1. Truth and content

- **Never invent** specifications, prices, stock levels, statistics, testimonials, clients, partnerships, certifications
  or opening hours. Product data comes only from `content/*.json`; company facts only from `src/lib/site.ts`.
- Follow the **claims policy** (Design Doc 3.1). "Authorized ZKTeco Distributor" stays behind
  `ZKTECO_AUTHORIZATION_CONFIRMED`. Company figures (years, installations, clients) must be flagged as company-stated.
  Don't show a founding year until AIMS confirms it.
- Missing data is shown honestly (for example "Specs on request" or a datasheet link), never filled with placeholders
  that look real.
- Anything that only simulates (quote submission, downloads) must be labelled as a demo in the preview (Plan ch. 16).

### 2. Design system

- Use **tokens only** (`src/app/globals.css` → `@theme`). Components contain no raw hex, rgb, px font sizes or
  shadows. If a value is missing, add a token with a comment saying why, then use it.
- **Green-700 is the action colour on light surfaces.** On night-green surfaces lime may carry text and actions where
  it measures ≥ 4.5:1 (the ratios are listed beside the tokens). Ink-300 is decorative only. No violet anywhere.
- **The skill's house rules apply** (`SKILL.md`, House rules): no caption or description under any image (licence
  credits go in one footer line); every visual renders at 1440, 1024, 768 and 390; **one section per screen** (each
  section one or two screens tall at 1440×900, the hero alone on the first); equal left and right content edges.
- **One system:** one button pair, one card style, one radius scale, one link look; two boxes deep at most.
- **First screen:** it says what AIMS sells, for whom or where, with one hard fact, and has at most two actions. One
  main action per screen. No carousels, no timed tabs, no stacked banners, nothing above the header.
- Typography follows the Design Doc ch. 5 scale. Use sentence case. Model codes are in IBM Plex Mono. Numbers in
  quantities, counts and specs use `tabular-nums`. Body text is 16 px minimum on inputs.
- **Imagery (skill `photos.md`):** AIMS's own product photographs lead, big and whole, a different picture each
  section. Context the client hasn't supplied (installations, offices, people at work) may use licensed stand-in
  photographs from the skill's library or its Wikimedia Commons/Unsplash search. Each stand-in is listed in the PR and
  README as a stand-in, credited in the one footer line, and never presented as AIMS's own premises, staff or
  customers. Real third-party icons keep their own colours (`icons.mjs`). No drawn look-alike logos.
- **Mobile first and uncluttered.** Design 390 px first. If a mobile view feels busy, remove things; don't shrink them.

### 3. Motion (skill `references/motion.md`)

- **Every page moves in three places, and nothing else moves:** (1) the hero enters once on load (about 1.1 s, then
  stands); (2) one dealt moment in a section of its own, two on a long page (eight sections or more), picked with
  `moments.mjs pick --page tech`; (3) the hover and press layer on every link, button, linked card and linked photo
  (card lifts 2px, photo zooms 1.02–1.03, button steps 1px and presses, underlines draw). As a tech site AIMS may also
  have loops inside a card's visual, one timed loop in the hero, one count, and the one effect or scene
  `effects-usage.md` deals.
- **Scrolling moves nothing but the dealt moment.** No card, row, tile or section fades, rises or staggers in on
  scroll; no parallax on text; no scroll-jacking or smooth-scroll libraries. A moment may hold its section with
  `position: sticky` while the page scrolls natively.
- The approved prototypes in `docs/prototypes/` (hero signal lines and verification, door kit) are AIMS's real
  domain motion: use them as the hero entrance and loop and as a dealt moment rather than adding generic effects.
  Port them; don't redesign them.
- The motion layer animates transform, scale and opacity (a hover may also change colour); a moment may also move the
  cheap properties its `meta.json` names. Never animate width, height, top, left, margin or padding.
- Loops pause off-screen; anything moving past 5 s has a pause button; at most four live WebGL contexts. Under
  `prefers-reduced-motion` everything rests at its final state and nothing stays hidden. Nothing flashes more than
  3 times per second.
- Effect and moment code loads lazily, only on pages that deal one, and the page must still meet §5.

### 4. Accessibility: WCAG 2.2 AA, built in

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

### 5. Performance (Plan AT-11)

- Throttled mobile: **LCP ≤ 2.5 s, CLS ≤ 0.05, home transfer ≤ 1 MB.**
- Use Server Components by default. Add `"use client"` only to the smallest interactive leaf, never to a page or a
  layout.
- Use `next/image` with explicit `width`/`height` (or `fill` plus sized parent) and `sizes`. Only the LCP image gets
  `priority`. No layout shift from images, fonts or late UI.
- Fonts come only from `src/app/fonts.ts` (self-hosted). Never use Google Fonts or other runtime CDNs.
- No new runtime dependency without a one-line justification in the PR. Prefer the platform and small utilities.
- The site never calls aimsuae.me or any third party at runtime (no trackers in the preview).

### 6. SEO and URLs (Plan ch. 12, AT-12, AT-13)

- Existing product, software and location URLs **never change**. New routes come from `src/lib/routes.ts`.
- Every old URL that changes needs a 301 in `src/lib/redirects.ts`, with no chains, and tests must stay green.
- Each page has a unique title of 60 characters or fewer via `generateMetadata`, a self-canonical, one H1, and
  JSON-LD where the plan requires it (Product, Organization, BreadcrumbList).
- Previews stay **noindex**. Only production at launch sets `SITE_INDEXABLE=true`.
- Navigation links only to built routes, valid filtered states (`/products?q=…`) or clearly external links.

### 7. Internationalisation and RTL

- **No hard-coded UI strings** in components. Add keys to `src/i18n/messages/en.json` **and** `ar.json` (a test
  enforces the same keys). Product data stays English unless AIMS supplies translations.
- Use **logical properties only**: `ms-/me-/ps-/pe-/start-/end-`, `text-start`. Never use `ml-/mr-/pl-/pr-/left-/right-`
  for layout. Mirror directional icons with `rtl:-scale-x-100`.
- Phone numbers, model codes and the wordmark stay LTR (`dir="ltr"`) inside RTL text.
- Build links with `localePath(locale, path)`. Never hand-build `/ar/...` strings.
- Arabic copy is a draft until AIMS's reviewer approves it (Design Doc ch. 17).

### 8. Code quality

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

### 9. Next.js 16 specifics (see `AGENTS.md`: read `node_modules/next/dist/docs/` first)

- Use `src/proxy.ts`, not `middleware.ts`.
- `cacheComponents` is on. Don't use bare `new Date()` / `Math.random()` in server render; use `"use cache"` or a
  client component. A `usePathname`/`useSearchParams` caller may need a `<Suspense>` boundary.
- The locale comes from `getLocale()` / `getDictionary()` (`next/root-params`), not prop-drilled.
- Because of the proxy rewrite, read the browser path on the client after hydration (see `LanguageSwitch.tsx`).
- Redirects use `statusCode: 301` (not `permanent: true`, which sends 308).

### 10. Testing and Definition of Done

A change is done only when all of the following hold:

- [ ] `pnpm check` and `pnpm format:check` pass, and `pnpm build` succeeds.
- [ ] `pnpm e2e` passes. A new page is flipped to `status: "built"` in `src/lib/routes.ts` in the same commit, so it
      is covered by the 200 / one-H1 / zoom / axe smoke test.
- [ ] Logic has unit tests. User flows from Plan ch. 18 (AT-01 … AT-14) get Playwright specs as they are built.
- [ ] It was checked at **390 px and 1440 px**, in **English and Arabic**, and with **keyboard only**.
- [ ] The design skill's gate reports `GATE: PASS` (or `GATE: OPEN` with every waiver and its reason in
      `.taste-skill/waivers.json`), and copy-lint has no FAIL. Report stand-in photographs and open FAILs in the PR.
- [ ] Docs were followed. Any deviation is recorded in `README.md` → Decisions.
- [ ] No test was skipped, deleted or weakened to make the suite pass. If a test is wrong, fix it and say why.

## Git

- Branch from `main` with a short descriptive name. Open a PR into `main`. CI must be green before merge.
- Write commit messages in the imperative mood, with a short subject and a body explaining what and why. Mention the
  doc chapter or AT-number.
- Keep commits small and focused. Never commit secrets, `.env*` (except `.env.example`), `.cache/` or build output.
- Never force-push a shared branch.

## Open questions waiting on AIMS (don't guess)

Logo · ZKTeco authorization wording · founding year (2011 or 2014) · opening hours · which phone serves which need ·
permission to link datasheets and software files · Arabic reviewer. Data issues from the import are in
`content/import-report.json` and `README.md`.
