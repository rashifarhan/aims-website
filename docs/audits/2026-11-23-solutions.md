# Audit: solution and software pages (agent C, 23 Nov 2026)

Pages: `/solutions/{access-control, entrance-parking, door-locks, pos}`, `/software`, `/software/{biotime-9-5,
biotimecloud, zkaccess-3-5}`, plus the shared catalogue `ProductCard` (checked on `/products`, a solution page and
`/zkteco-distributor-in-dubai`). English and Arabic at 1440, 1024, 768, 390 and 320.

Format: ID · severity (P0 broken/a11y/truth, P1 clearly wrong or below the skill's bar, P2 nice to have) · page ·
skill · what · fix. "Conflicts with CLAUDE.md §x" marks a finding the project rules overrule: recorded, not fixed.

## 1. Taste (`design-taste-frontend`)

Production build served on :3203. `gate.mjs <url> --profile .taste-skill/chrome-C` (kind tech, category "ZKTeco
access control and time attendance", primary "Request a quote"), then `copy-lint.mjs --kind tech` on the served
HTML. Screenshots at 1440/1024/768/390/320, EN and AR (reduced motion so moments rest on their final frame); overflow
probe: 0 horizontal overflow on all 100 loads (8 pages + `/products` + `/zkteco-distributor-in-dubai`).

### Raw results (before)

| Page                        | Gate FAIL | copy-lint                                             |
| --------------------------- | --------: | ----------------------------------------------------- |
| /solutions/access-control   |        47 | 0 FAIL, 1 WARN (stat strip)                           |
| /solutions/entrance-parking |        47 | 0 FAIL, 0 WARN                                        |
| /solutions/door-locks       |        46 | 0 FAIL, 0 WARN                                        |
| /solutions/pos              |        43 | 0 FAIL, 0 WARN                                        |
| /software                   |        35 | 0 FAIL, 0 WARN                                        |
| /software/biotime-9-5       |        44 | 2 FAIL (slop word, stock phrase), 1 WARN (-ing rider) |
| /software/biotimecloud      |        43 | 0 FAIL, 0 WARN                                        |
| /software/zkaccess-3-5      |        40 | 1 FAIL (slop word)                                    |

About 25 FAILs per page are the shell or the kit's markup contract, the same on every page of the site:
`container` (no `.wrap`), `container-edges`/`row-lines`/`split-pair`/`one-heading`/`section-height` on the header,
skip link and footer, `phone-number` ×4 (AIMS's real lines), `text-contrast` on the wordmark's lime full stop,
`field-label` on the header search, `off-grid` on the footer's search chips. These are not page faults and are not
counted below.

### Findings

- T-01 · P1 · all four solution pages · Taste House rule 3 (`section-height`, `section-tile`, `one-section`,
  `one-heading`) · T3 sections keep their natural height on a desktop: the moment is 0.64–0.91 of a screen, the
  closing band 0.4, so two headings share a screen 30–38 % of the time. The homepage and the software pages already
  hold one section per screen. · Give T3 sections the same desktop-landscape screen rule (`main > section` 100svh,
  content centred) in `solution.css`.
- T-02 · P1 · solution pages · Taste House rule 5, CLAUDE.md §2 one system (`button-styles`, `same-action`) · The
  recommended-product card (`.pick-card`) is a second card style beside `.ui-card`: no 2px lift, photo zooms 1.04 (rule:
  1.02–1.03), and a filled "Add to quote" on every card (a wall of filled green; 44px against the hero's 54px). The
  listing card uses the shared card and an outline Add. · Put `.pick-card` on `.ui-card ui-card-interactive` +
  `ui-card-photo`, outline Add.
- T-03 · P1 · /solutions/access-control (template) · Taste rule 7, `card-visual` · The software cards hold only text,
  though every platform has AIMS's own picture in `content/software.json`. · Show the platform's picture in each card.
- T-04 · P1 · /solutions/pos, /software/biotimecloud · `photo-upscale` · POS hero ZKBio900/AIO1000 photo is 262px
  wide shown at 350px (the 350px cap assumes every POS photo is 350 wide); BioTime Cloud's 328px picture is shown at
  447px. · Cap each hero picture at its own pixel width, from the data, not a hand-set rem.
- T-05 · P1 · /solutions/entrance-parking (template) · Taste copy, long data · The TS1022 Pro card's heading is
  the imported model field "TS1022 Pro Tripod Turnstile w/ controller and combination of fingerprint & RFID Reader",
  set in the mono heading face: six lines at 390. 41 products carry a description in `model`. · Show the code part in
  mono and the rest as the card's description line, as `ProductCard.describe()` does.
- T-06 · P1 · /software/biotimecloud · `empty-area` (64 %), `section-air`, `section-gaps` · "Where BioTime Cloud
  connects" is a full screen holding a four-branch diagram 240px tall. · Let the diagram fill its column (scale the
  drawing up) so the section is not two-thirds empty.
- T-07 · P1 · all solution pages and software detail pages at 768×1024 · `hero-fill` · The next section's heading
  shows on the first screen at a portrait tablet (hero ends at 819–874px). The rule is desktop-only by design ("Short
  desktop windows and portrait tablets keep the natural height", sections.css). · Accept at 768 (homepage decision);
  record, not fixed.
- T-08 · P2 · all four solution heroes · Taste "the product big" · The hero photograph is 1000×1000 with the device
  occupying about a third, so at 1440 the terminal reads ~170px wide in a 480px column. · Let the photo fill its
  column (max 36rem); a tighter crop needs AIMS's source files.
- T-09 · P2 · solution pages at 390 · `empty-visual` · The 5th/6th rail cards' lazy images never load in the checker
  (it never scrolls the rail sideways). Browsers load them as the rail scrolls. · Checker artefact; no change.
- T-10 · P2 · solution pages · `copy-headline` · h1s ("Decide who opens every door.") don't contain the checker's
  category words; the lead names the products and the UAE. · The h1s are approved copy; the gate's category is the
  site's, not each page's. No change.
- T-11 · P2 · all · `copy-headings` · Moment and step headings ("One credential, one lane open.") name no noun. ·
  Approved copy (README → Software polish); no change.
- T-12 · P1 · /software/biotime-9-5, /software/zkaccess-3-5 · copy-lint `copy-slop-word` ("seamless", "powerful"),
  `copy-stock-phrase` ("with just a few clicks") · All hits are inside AIMS's own imported description
  (`content/software.json`, shown under "Read AIMS's full description" and the feature list). · Conflicts with
  CLAUDE.md §1 (product data only from `content/*.json`, never rewritten): not fixed; the page's own copy is clean.
- T-13 · P2 · /software · `moment-none`, `hero-screen`, `no-visual` · The Download Centre hub deals no moment and its
  intro is not a full screen. · Out of scope (the hub's entrance and moment were postponed by the user); README
  records "the data supports none honestly".
- T-14 · P2 · software detail pages · `focus-ring`/`focus-visible` on `.sw-card-link` · The link drops its outline
  because the card draws a 2px green-700 outline with `:has(:focus-visible)`; the checker reads only the link. ·
  False positive; verified by keyboard in §2.
- T-15 · P2 · solution pages · `scroll-reveal`, `effect-kind` · The dealt moment starts on IntersectionObserver
  (MomentTrigger) and its `data-moment="true"` is not a kit moment id. · Expected: the moment is the one thing that
  plays when its section enters (CLAUDE.md §3); same as the homepage's waived door kit.
- T-16 · P2 · solution pages · `no-visual`, `text-only` on methods, process, FAQ and closing · Icon cards and step
  lists count as no visual. · Template decision (Plan 14 T3 rows); no change.
