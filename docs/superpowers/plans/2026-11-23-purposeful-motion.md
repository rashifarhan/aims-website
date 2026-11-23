# Purposeful Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen five important AIMS screen types with original explanatory motion and studio lighting.

**Architecture:** Keep existing Server Components, approved illustrations and product data. Add a small client wrapper for the reversible door story, use CSS for entrances and diagram feedback, and refine the existing attendance observer. No new runtime dependencies.

**Tech Stack:** Next 16.4.6, React 19, CSS, WAAPI, IntersectionObserver, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-23-purposeful-motion-design.md` (client approved).

## Global Constraints

- Kind: product / tech / hardware. Extend the existing AIMS palette, Inter/IBM Plex typography, hero compositions and approved SIGNAL/UNLOCK moments; no new dealer choices or competitor motifs.
- Follow Master Plan ch. 6, 9, 14, 16, 18 and Design Doc ch. 3–9, 13, 14. CLAUDE.md governs facts, accessibility and performance.
- CSS/WAAPI only; no new runtime animation library, WebGL scene, video or image asset.
- Keep real catalogue data, URLs, model codes, aligned container edges and immediately usable actions.
- Desktop door section at most two viewport heights; phones use a one-shot drawing in ordinary flow.
- Runtime reduced-motion changes and no-JS show the final readable state. No generic scroll reveals.
- Throttled mobile LCP ≤2.5 s, CLS ≤0.05, homepage transfer ≤1 MB; animation JS ≤15 KB/page.
- Run pnpm check, format:check, build and e2e; preserve raw design gate results and disclose open findings.
- Work on `codex/purposeful-motion`; no merge or publication. Implement inline following the client's approval; one independent final review.

## Review Focus

- Anchor entry, fast scrolling and scrolling back must immediately show the correct door stage (Task 1 browser tests).
- Reduced-motion changes after hydration must cancel motion and reveal the final frame (Tasks 1–3 browser tests).
- Narrow or short windows must show a complete ordinary-flow scene, never sticky content under the header (Task 1 responsive tests).
- Arabic shaping, long product names and missing connection data must remain readable with usable actions (Task 3 browser tests).
- Navigation back to a retained Next page must not leave hidden diagrams or duplicate running animations (Task 4 browser tests).

## Files and responsibilities

- `src/components/motion/storyProgress.ts` and `.test.ts`: clamp geometric scroll progress and map it to a stage.
- `src/components/motion/DoorStory.tsx`, `doorTimeline.ts`, `doorStory.css`: scoped responsive story lifecycle, approved door keyframes, scene layout/active states.
- `src/components/home/DoorTeaser.tsx`, `premium.css`: replace timed entry with DoorStory; remove superseded keyframes only.
- `src/components/solution/access-control/SolutionDoor.tsx`, `door.css`: share the story without importing homepage surfaces.
- `src/components/solution/StoryProgress.tsx`, `AttendanceDrawing.tsx`, `solution.css`: stable attendance stages, bounded transport motion and readable step feedback.
- `src/components/motion/entrance.css`, `src/app/globals.css`: existing-token entrances and studio-light tokens, scoped to five targets.
- Homepage hero CSS/animation, `ProductSummary.tsx`, `product.css`, `SoftwareHero.tsx`, `software.css`, `ConnectsDiagram.tsx`, `SoftwareSignal.tsx`: coordinated entrances, still lighting and signal endpoints.
- `tests/e2e/purposeful-motion.spec.ts` plus existing homepage/access/attendance specs: new motion behavior and deliberate trigger changes.
- `README.md`, `docs/design-checks/purposeful-motion.md`: decisions and verified results.

### Task 1: Reversible door story

**Interfaces:** `storyProgress(top: number, height: number, viewport: number): number`; `storyStep(progress: number, count: number): number`; `DoorStory({children, className, labelledBy})` renders the section and accepts existing server-rendered copy/art. Children mark six list items with `data-door-step`.

- [x] Write failing unit tests for offscreen bounds, collapsed scroll range, direct middle entry and reverse progress; run `pnpm test src/components/motion/storyProgress.test.ts` and observe missing-module failure.
- [x] Write browser tests for six-stage progress and reversal on home/access, mobile completion without pinning, reduced-motion at load/runtime, and no-JS final state. Run against the existing production preview to demonstrate the absent scroll behavior.
- [x] Implement the pure helpers and shared door wrapper. Build paused WAAPI timelines over the approved reader/controller/lock/exit/credential/software sequence; scrub with one passive scheduled read per frame. Cancel cleanly on unmount/preference change, use a short one-shot on small/short screens, and show final content without enhancement.
- [x] Integrate the two existing door sections and active-step attributes. Keep drawing geometry, links and translated copy; remove old timed door CSS and update its existing tests to verify the approved replacement.
- [x] Run unit suite, build and targeted home/access/new motion browser tests. Expected: bounded progress, reversible stages, mobile completion and finished fallbacks all pass.

### Task 2: Attendance explanation

**Interfaces:** Retain `StoryProgress({steps,label,children})`, `[data-story-step]`, `data-step`, and final server stage. Existing selectors remain compatible.

- [x] Add failing runtime preference/reverse-navigation tests and a test that punch motion finishes while the visitor remains on a stage.
- [x] Refine transitions using existing tokens; use readable active-step number/rule treatment. Replace indefinite punch animation with a short finite sequence, paused when hidden. Remove oversized mobile sticky behavior; use ordinary-flow drawing and intact step text.
- [x] Run attendance and motion tests in desktop/mobile and both locales. Expected: no indefinite transport loop, backward stages work, reduced/no-JS content complete.

### Task 3: Entrances, lighting and signal feedback

**Interfaces:** Existing hero/action markup and data-derived connection lists remain the source of truth. Entrance classes wrap complete shaping runs and do not wrap controls.

- [x] Add failing behavior coverage for product entrance and mid-session reduced-motion diagram completion. Keep actions immediately usable and verify Arabic text intact.
- [x] Apply shared existing-token line/whole-text entrance rhythm to home, the two selected solution heroes, product and software templates. Add a fixed, still green studio-light layer to hero art only; preserve white product photographs and contrast. Coordinate the existing hero verification wash with its current loop and pause control.
- [x] Refine product/software path draw and endpoint feedback in their existing moments; keep node text visible throughout. Repair MomentTrigger lifecycle for runtime preferences and route restoration if tests demonstrate it is necessary.
- [x] Run product/software/home/targeted motion tests. Expected: actions work during entry, reduced/no-JS is complete, diagrams retain actual data, no unintended animation on catalogue/quote/other solution pages.

### Task 4: Verify and document

**Interfaces:** Consume the five finished target types; no new visual scope.

- [x] Run pnpm check, format:check and production build, then complete e2e and isolated mobile performance checks. Record any pre-existing failure separately with evidence.
- [x] Use design-skill scripts serially for screenshots at 1440/1024/768/390 (English/Arabic), moving/final frames, layout checks, copy lint and performance. Run the armed gate, preserve raw output and stay within its three-round limit.
- [x] Review keyboard flow, reflow, reverse/fast scroll, no-JS, runtime reduced motion and navigation restoration in a real browser. Add a regression test for any observed substantive failure before fixing it.
- [x] Request one fresh whole-branch code/motion review; fix important findings with tests and rerun affected checks.
- [x] Record decisions/results and any accepted/open exceptions; run the mandatory checks before committing. Commit the focused implementation and docs on the feature branch. Leave main untouched and provide a running preview.

## Plan review

Self-reviewed against the approved design: five targets, original visual language, scope boundaries,
accessibility, responsive behavior and performance all have owners above. The client's design
approval authorizes implementation; native execution keeps the shared motion work in one context.

## Delivery status

Implemented and verified as a review draft. Native composition/copy findings remain disclosed in
`docs/design-checks/purposeful-motion.md`; no native PASS or publication readiness is claimed.
