# Three-skill audit: location pages (23 Nov 2026)

Agent A, branch `claude/audit-locations`. Pages: `/locations`, `/zkteco-distributor-in-dubai` (`/ar/zkteco-dubai`),
`/zkteco-distributor-in-oman`, `/zkteco-distributors-in-kenya`, English and Arabic, at 1440, 1024, 768, 390 and 320.
Plan: `docs/superpowers/plans/2026-11-23-three-skill-audit.md`.

Format: ID · severity (P0 broken/a11y/truth, P1 clearly wrong or below the skill's bar, P2 nice to have) · page ·
skill · what · fix.

## 1. Taste (`design-taste-frontend`)

Built with `pnpm build`, served on port 3201. Gate armed with `--kind tech --category "ZKTeco access control and time
attendance" --primary "Request a quote"`, run one page at a time with `--profile .taste-skill/chrome-A`. copy-lint run
on the served HTML (`curl`) with `--kind tech`. Screenshots at 1440, 1024, 768, 390 and 320 (EN and AR, reduced
motion for the final frames) were read page by page.

**Raw results, before fixes**

| Page                                       | Gate               | copy-lint                                  |
| ------------------------------------------ | ------------------ | ------------------------------------------ |
| `/locations`                               | `GATE: FAIL 41`    | 0 FAIL, 0 WARN (INFO: one two-fragment h1) |
| `/zkteco-distributor-in-dubai`             | `GATE: FAIL 41`    | 0 FAIL, 0 WARN                             |
| `/zkteco-distributor-in-oman`              | `GATE: FAIL 36`    | 0 FAIL, 0 WARN                             |
| `/zkteco-distributors-in-kenya`            | `GATE: FAIL 36`    | 0 FAIL, 0 WARN                             |
| `/ar/zkteco-dubai`                         | `GATE: FAIL 52`    | 0 FAIL, 0 WARN                             |
| `/ar/locations`, `/ar/…oman`, `/ar/…kenya` | not gated (rounds) | 0 FAIL, 0 WARN                             |

Probe at every width (EN and AR): no horizontal scroll, no control in `<main>` under 44px, one h1.

**Findings in this branch's scope**

- T1 · P1 · all four pages · Taste House rule 3 (CLAUDE.md §2) · `section-height`, `one-section`, `one-heading`: no
  section is one screen at 1440×900 (offices 444px, FAQ 308px, close 364px, reach 619–727px), so two or three
  headings share a screen. At 768×1024 the next section shows under the hero (`hero-fill`). · Do what the homepage
  does: on a landscape desktop each location section is one screen with its content centred; the hero fills the first
  screen from 640px (portrait tablet included).
- T2 · P1 · `/locations` (EN, AR) · `copy.md` (h1 names the category) · `copy-headline`: "Visit in Dubai. Delivered
  across the GCC and Africa." never says what is sold; only the lead does. · Name ZKTeco in the h1, keep the place.
- T3 · P1 · Oman (EN, AR) · House rule 2 (every visual reads) · The Gulf crop of the reach map cuts the dot field
  with a hard vertical edge at its left and top, so it reads as a cut rectangle of dots, not land. · Fade the crop's
  open edges with a mask on the map frame (locations.css), no change to the shared `ReachMap`.
- T4 · P2 · T7 pages · `copy-headings`: "Models to start from" names no thing the checker knows. · "Products to start
  from" (true: two terminals, a controller and an Alpha lock, so not "ZKTeco models").
- T5 · P2 · `/locations` · `copy-headings`, `heading-scale` (390): the market group labels "GCC"/"Africa" are 13px
  h3s beside 18px office h3s; the close "Tell AIMS where it's going" names no thing. · Make the group labels list
  labels (`aria-labelledby`), not headings; name the delivery in the close heading.
- T6 · P2 · all · `split-pair`: the reach band's columns are centred on each other (31px apart at the top). · Top-align
  them (`align-items: start`), as the skill's splits are.
- T7 · P2 · all, 390 · section rule "its h2 first": on phones the map is moved above the band's h2 (`order: -1`). ·
  Keep the h2 first; the map follows the lead and steps.
- T8 · P2 · all, 390 · `section-gaps`: the close sits 122px above the footer against a 75px median. · Leave: the
  close's margin is the T3 template's (solution.css) and the footer's `mt-auto`; for the integrator.
- T9 · P2 · `/locations`, Dubai · `no-visual`, `card-visual`, `text-only`: the offices section, its cards, the FAQ and the
  close hold no picture. AIMS has supplied no photographs of its showroom or offices; the homepage made the same call
  (README "Homepage through the taste skill": no stand-ins added). · Not fixed. Open for the user: a licensed stand-in
  of Deira (the district, never shown as AIMS's premises) would need the footer credit line, which is shared.
- T10 · P2 · T7 pages, 390 · `no-visual` on `#models`: the cards do hold AIMS's product photographs, at the
  catalogue card's 88px phone thumbnail, below the checker's size threshold. · Judged false; the card is Agent C's.

**Conflicts with CLAUDE.md or outside this branch (not fixed, no waiver added)**

- `phone-number` (offices, footer): AIMS's published lines are brief-given (CLAUDE.md "The brief is this repository";
  §1). Conflicts with CLAUDE.md §1.
- `scroll-reveal`, `effect-kind` on `section#delivery`: the reach map is the approved prototype port started once by
  `MomentTrigger`, not a kit moment; the homepage waives the same (`.taste-skill/waivers.json`). Conflicts with
  CLAUDE.md §3 ("port them; don't redesign them").
- `container` (no `.wrap`), `container-edges` on the header, skip link and footer, `row-lines`/`split-pair`/
  `one-heading` on the footer, `field-label` on the header search, `text-contrast` on the wordmark's lime dot:
  the shared shell and the project's `page-container` system (README "Homepage through the taste skill"; Codex's
  shell renames were left out on purpose). Shared files: not this branch's.
- `button-styles`: fill + outline is the project's one button pair (README "Site-wide polish"); the other two counted
  are the header's Quote and the footer's search chips (shared shell, Agent B).
- `off-grid` "Hotel lock" (390): a footer chip (Agent B).
- `split-pair` on the hero: the T3 hero centres copy and photo on every T3/T7 page (solution.css); changing it only here
  would split one template in two. For the integrator.
- Arabic `stagger`/`off-grid` on the steps, lead and fact: the checker measures left edges, and right-aligned Arabic is
  ragged on the left by design (CLAUDE.md §7). Judged false.
