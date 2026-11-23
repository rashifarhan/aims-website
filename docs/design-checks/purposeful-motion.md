# Purposeful motion: decisions and verification

Design approved 23 November 2026. Branch `codex/purposeful-motion`, main baseline `fe6d68e`.
Kind: product / tech / hardware. Existing AIMS palette, typography, compositions and domain prototypes.
Sources: Master Plan ch. 6, 9, 14, 16, 18; Design Doc ch. 3–9, 13, 14; CLAUDE.md sections 2–5, 7, 10.

The raw gate, copy-lint, image and performance outputs this report names (`purposeful-motion-*.json`, `*.txt`) are
local tool output and are not committed (CLAUDE.md: only `.taste-skill/waivers.json` is). Rerun the gate, copy-lint
and `pnpm e2e:performance` against a production build to regenerate them.

## Implemented direction

The first batch covers home, Access Control, Time Attendance, the product-detail template and
the three software-detail pages, in English and Arabic. Real catalogue images/data lead. New
lighting is CSS behind the product; no photograph is recoloured, and no asset comes from NUZON.
Its supplied audit informed the comparison, not the design's authority.

The homepage and Access Control share the approved door-kit geometry and model links. A paused
WAAPI clock follows native scroll within a two-screen desktop section and reverses on scrolling
back. This replaces the earlier timed entrance, as approved in the design. WAAPI keeps the
multi-part prototype in one reversible timeline across supported browsers without a library.
There is one coalesced geometric read per scroll frame; unchanged progress does not seek again.

On phones, tablets and short windows the door plays once for four seconds, starting only when
its drawing is visible. It pauses out of view/when the tab is hidden, and keeps its clock across
same-mode resizes. No sticky phone scene. Missing WAAPI and reduced motion show the complete still.

Attendance retains its four stages and labelled sample data. Desktop supports forward/backward
steps; phone playback takes 2.2 seconds of visible time in ordinary flow. Transport dots are finite,
not an indefinite loop beside the text. Hidden/offscreen phone playback resumes where it paused.

Product/software connection labels remain readable from the start. Paths draw together from
their source and their endpoint dots confirm arrival; model compatibility still comes only from
the existing catalogue. MomentTrigger now responds to runtime motion preferences and keeps
multiple mounted owners from disabling one another's effects.

## Entrance choreography

| Element                                     | Role              | Start      | Duration   | Relationship / purpose                                                              |
| ------------------------------------------- | ----------------- | ---------- | ---------- | ----------------------------------------------------------------------------------- |
| Home headline line 1 / other target title   | Lead              | 0          | 900 ms     | Establish reading order; whole shaping runs, no character splitting                 |
| Home headline line 2                        | Lead continuation | 120 ms     | 900 ms     | Overlap the first supplied line                                                     |
| Supporting copy                             | Support           | 120–200 ms | 800–900 ms | Overlap title; small rise and opacity                                               |
| Product/solution/software image             | Support           | 120 ms     | 900 ms     | Settle beside title; image remains visible throughout                               |
| CTA controls, product facts and model codes | Static            | Immediate  | —          | Usable while the entrance settles                                                   |
| Studio light                                | Static            | Immediate  | —          | Product depth; homepage verified light shares its existing verification clock/pause |

No animation was added to filters, quantities, comparison tables, specifications or quote entry.
Existing hover/press tokens and keyboard behavior remain. No scroll reveal outside named moments.

## Independent review

One fresh reviewer inspected the whole diff and new modules. Three Important findings were
confirmed: class separators lost during formatting, phone door starting before the drawing was
visible, and resize restarting its clock. Each received a browser regression observed failing
before correction. Whole-class ternaries protect the existing container/photo classes.

The reviewer labelled offscreen attendance advancement Minor. We treated it as Important because
the plan explicitly requires pausing hidden playback, and added a failing offscreen test before
introducing the visible-time clock. No finding was deferred.

## Verification status

Baseline: 123 unit tests passed. Initial feature checks: 127 unit tests, 44 door/home browser tests,
34 attendance browser tests and 84 product/software/home motion browser tests passed. These
intermediate runs preceded the review corrections and are not the final completion evidence.

After the review fixes: `pnpm check` passed (127 unit tests), production build succeeded, and the
complete browser suite passed at its configured port 3100: **507 passed, 17 inherited viewport
skips**, no retries. No test was skipped or removed for this change. The old hero test's exact
1100 ms + 350 ms assertion was replaced with the approved total entrance budget ≤1100 ms and
single-iteration requirement; its verification/tick/reduced-motion assertions remain.

The three motion-bearing route entry chunks measure 7.4–8.9 KB gzip each, including their
non-motion UI code, below the 15 KB/page animation budget. No runtime dependency was added.

## Final mobile performance

Thirty isolated measurements passed: five screen types × English/Arabic × three runs, at 390×844,
150 ms latency, 1.6 Mbps download and 4× CPU throttling, browser cache disabled. Worst LCP was
2.228 s (Arabic home); maximum CLS was 0.017435 (Arabic software). Homepage transfer was
409,144–500,525 bytes. Raw measurements: `purposeful-motion-performance.json`.

## Responsive and lifecycle verification

The native skill captured all five targets in both languages at 1440, 1024, 768 and 390 widths:
40 successful captures. Five responsive contact sheets and the original full-page/section shots
are in `.taste-skill/purposeful-motion/`. Header/hero edges, whole photographs and Arabic shaping
were inspected. The shared door's start/end frames show the readable parts beside the held drawing.
The 6 additional back-navigation checks pass with no duplicate story animations.

The layout checker's `--shots` mode throws `Cannot read properties of undefined (reading 'map')`
after its first screen because this site's existing `page-container` returns no kit `.wrap`
sections. The kit was not edited. Its own `shoot.mjs` supplied the 40 captures instead; this error
is retained in each `*-layout.stderr` file.

Four mobile screenshot logs warn about recommendation images still outside the horizontal
viewport. The tool's readiness probe checks vertical overlap only. A real horizontal-scroll
regression verified all 48 photos across the two solution routes, both languages and both browser
projects; all decoded, selecting 256/640px sources. See `purposeful-motion-image-readiness.json`.

## Native gate and inherited copy findings

The homepage's first raw native report is **GATE: FAIL 53 (round 1 of 3)**, preserved verbatim in
`purposeful-motion-gate-home.txt`. Every finding has a location-specific decision in
`purposeful-motion-gate-home-decisions.json`. These preserve the existing site system and the
client-approved domain motion; they are not a claim that the checker passed.

The 5 global waivers remain specific. The ignored catalogue-card waiver matched two findings;
its uniform-index rationale is retained in the decisions report. A footer-wordmark dot waiver
replaces it, and the door waiver now accurately describes the approved scroll/phone triggers.
The raw layout/spacing, real-contact, text-section, native-moment and typography findings remain visible.

The header-search visible-label finding was reviewed against
[W3C's explanation of SC 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions),
which explicitly describes a magnifying-glass cue for a global header search. The existing
search also has a programmatic label and passed keyboard/axe checks.

Copy lint has zero FAIL on home and the two solution routes, in both languages. Product F18 and
BioTime 9.5 retain FAIL hits in their imported AIMS descriptions: `unparalleled`, `seamless`,
`seamlessly`, `powerful`, and `with just a few clicks`. No motion implementation introduced this
wording. All exact sentences and WARNs are preserved in `purposeful-motion-copy-findings.json`;
these inherited copy findings are disclosed, not relabelled PASS or hidden from the checker.
This is an explicit limitation of the review draft: imported copy FAILs and native composition
findings remain. The motion implementation is reviewable; the raw gate is never labelled PASS.
The Access Control round returned **GATE: FAIL 51 (round 2 of 3)**; the product-template
round ended the build at **GATE: OPEN 49**, never PASS. Raw reports are preserved as
`purposeful-motion-gate-access-control.txt` and `purposeful-motion-gate-product.txt`.
The native budget is exhausted; no aesthetic fix rounds were added or reset.

One Access Control finding was a genuine accessibility issue: at 1152px, the percentage-based
studio-light pseudo-element added 5px of horizontal overflow. Controlled probes isolated the
light layer (removing header/footer/drawing/SVG overflow did not fix it). A fixed spacing bleed
inside the 24/32px gutters removes it. This functional reflow fix follows CLAUDE.md 4's priority
over design-check round limits; the earlier raw report is retained. All five targets now pass
120 configured-width checks across both languages and browser projects at 320/390/768/1024/1152/1440.
The test compares to the configured viewport, because mobile innerWidth can grow to conceal overflow.
After this final CSS hardening, production build and pnpm check passed, and the 44 focused
motion/home-interaction browser checks passed. No checker FAIL was silently turned into PASS.
The final build was remeasured after the overflow fix: all 30 isolated mobile cases passed again
with the numbers above. The native skill performance tool ran at 1440/390 on all five targets:
home, Access Control, Time Attendance and software had zero FAIL (WARNs retained in raw JSON).
Product F18 reports two FAIL rows, both `images without width+height` for its four fill images.
CLAUDE.md 5 expressly permits `fill` plus a sized parent: the hero uses a reserved 4:3/square frame
and the three accessory images use fixed 80px frames. Native product CLS measured 0.000 at both
widths; no image or layout-shift fault was reproduced. Raw results are the five
`purposeful-motion-native-perf-*.json` files. The tool was not changed to suppress these findings.

The branch remains a **review draft**, with the exact inherited copy and composition findings
attached. Functional/axe/reflow and project performance checks pass; native OPEN and raw copy
FAILs are not represented as a clean design gate.

Four post-fix native spot captures (English/Arabic Access Control at 1152px, Arabic software
and reduced-motion attendance at 390px) completed successfully and were inspected. The original
40 responsive captures and all raw native findings remain available; no results were overwritten
to conceal the overflow finding.
