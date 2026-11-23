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

## 2. Impeccable (`impeccable` audit, critique, then harden/adapt/polish)

`impeccable context` loaded PRODUCT.md and DESIGN.md (North Star "The Trusted Showroom"). `impeccable detect --url`
on the hub, Dubai, Oman and Arabic Dubai: one finding each, "Primary font: Inter" (overused font), judged false:
DESIGN.md pins Inter, and the brief wins. Then a keyboard walk (Tab through `<main>` on the hub at 1440, Arabic Dubai
at 390, Oman at 1440), map-label measurement, the 1440/1024/768/390/320 screenshots, and a source read of
`src/components/locations/*` and `locations.css`.

**Audit health score**

| #   | Dimension                | Score     | Key finding                                                                                                                                                                                                  |
| --- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Accessibility            | 3         | Every stop has a visible ring (green on paper, lime on night green), no stop under the sticky header, 44px targets, axe 0 in `locations.spec.ts`; the hub's market group labels are headings at caption size |
| 2   | Performance              | 3         | One preloaded hero photograph, lazy product photographs, the map is inline SVG; each page imports the whole homepage `sections.css` for a few classes                                                        |
| 3   | Theming                  | 4         | Tokens only in `locations.css`; lime only on night green                                                                                                                                                     |
| 4   | Responsive               | 3         | No horizontal scroll at 320–1440 in either language; desktop sections are not screen-sized (T1); 320 wraps the hero button and the breadcrumb                                                                |
| 5   | Implementation integrity | 3         | Coherent with the T3 template and the shared card and buttons; the Oman crop reads as a cut rectangle (T3)                                                                                                   |
|     | **Total**                | **16/20** | **Good**                                                                                                                                                                                                     |

**Findings in this branch's scope** (Taste T1–T3 cover the layout, the hub h1 and the Oman crop)

- I1 · P2 · all, 1440 · critique (hierarchy) · The Dubai fact line, the hero lead and the showroom card all give the
  showroom address, and on the hub the fact and the first card repeat it: the first screen's one hard fact is
  correct, but nothing new is learnt on the way down. · Keep (the fact is House rule 5's hard fact; the card holds the
  map and call actions); noted, not changed.
- I2 · P2 · `/locations` · harden (semantics) · The market group labels "GCC" and "Africa" are h3s styled as 13px
  captions under the band's h2, so a screen reader's heading list shows two bare region names beside the office
  names. · Same fix as T5: a list label (`aria-labelledby`), not a heading.
- I3 · P2 · all, 1440 · critique (layout) · The reach band centres the text column against the map, so on Oman, where
  the map is short, the map floats mid-band with empty dark above and below. · Top-align (T6) inside the one-screen
  band (T1).
- I4 · P2 · Oman · polish · The Gulf crop's dot field ends in a hard edge at the map's left and top (T3). · Mask the
  crop's open edges.
- I5 · P3 · all · optimize · Each location route imports `home/sections.css` (the whole homepage sheet) for the
  button and text-link classes. · Leave: the shared button classes live there; moving them is the integrator's.

**Outside this branch's files (for the integrator / owners)**

- I6 · P2 · all, 320 · adapt · The breadcrumb wraps with its "/" starting the second line ("/ ZKTeco supply to
  Oman"). · Shared `Breadcrumbs`: keep each separator with the item after it (`white-space: nowrap` on separator +
  label) or allow the current page label to truncate.
- I7 · P2 · Oman, Kenya at 320; AR close everywhere at 320 · adapt · `.home-button` wraps to two lines ("Request an
  export quote", "ابدأ طلب عرض سعر للتصدير") with the arrow pushed to the far edge. · Shared button: balance the
  label (`text-wrap: balance`) and keep the arrow beside the text (`justify-content: center` with a gap), or let the
  close panel drop its inline padding at 320 (solution.css, Agent C).
- I8 · P2 · all, 320 · adapt · The footer's phone numbers wrap mid-number ("+971 4 252 / 3253"). · Agent B (footer):
  `white-space: nowrap` on the number.
- I9 · P1 · Arabic T7 pages · adapt · `ProductCard` spec values run flush to the card's left edge in Arabic (e.g.
  "4(2 RS-485 Reader, 2 26-bit wiegand reader)"), already on Agent C's checklist. · Agent C.
- I10 · P2 · T7 pages · a11y · The product card's title link is 20–23px tall in the Tab walk; the card's own Add is
  44px. · Agent C (`ProductCard`): the title link is the card's stretched link, so the target passes by spacing
  (WCAG 2.5.8), but its ring is the size of the text.

**Positive**

- Real AIMS contacts, honest "Opening hours aren't published yet", no invented office abroad (Oman and Kenya say
  "supply to"), English addresses and phone numbers kept LTR inside Arabic.
- Every market on the hub is a page or a preset export quote, each with a spoken destination (", supply page" /
  ", start an export quote").
- Reduced motion and no-JS rest on the finished map; the map is one `role="img"` with a place-naming label.
