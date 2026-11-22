# Individual Location Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Execute natively in this session with an independent final review.

**Goal:** Build the four retained T7 location pages and connect them to the Locations hub.

**Architecture:** Shared server components render Dubai and export content from typed configuration and the bilingual dictionaries. Small client leaves reuse the quote store and route-map motion. Explicit canonical paths pair the two Dubai URLs.

**Tech Stack:** Next.js 16.4.6, React 19, TypeScript, Tailwind v4, Zod, Playwright/axe; Node 22 and pnpm 10.

**Spec:** `docs/superpowers/specs/2026-11-22-location-pages-design.md`, approved by the client in chat on 22 November 2026.

## Global Constraints

- Preserve the four public URLs; no new runtime dependencies or invented facts.
- Token-only styles, logical properties, shared container edges and bilingual dictionary strings.
- Server-rendered pages; visible final states without JavaScript and under reduced motion.
- Quote need/country survive product additions; preview contacts and submissions remain guarded.
- Zero axe violations, titles ≤60 characters, noindex, canonical/hreflang pairs, 44px targets and 320px reflow.
- The hub's historical gate exceptions do not automatically cover new T7 findings. Keep the kit unchanged and report actual results.

## Review Focus

- Dubai language switching must reach the actual legacy Arabic/English URL in both directions, including queries and direct alias visits.
- Existing quote lines and export destination survive adding a model and later opening a plain quote URL.
- JavaScript disabled and live reduced-motion changes leave content and map at readable final states.
- Long Arabic text at 320px must retain logical reading order, LTR model/phone values and visible focus.
- Export copy and structured data must not imply an Oman/Kenya office, local installation team, confirmed duration or warranty terms.

## Task 1: Routing and destination contract

Files: create `src/lib/locationPages.ts` and `src/lib/locationPages.test.ts`; modify `src/i18n/config.ts`, `src/lib/seo.ts`, `src/components/shell/LanguageSwitch.tsx`, `src/lib/redirects.ts` and corresponding tests.

- [x] Write and run failing tests for Dubai locale URL pair, direct 301 alias, other locale links unchanged, typed market quote URLs and existing destination preservation.
- [x] Implement a shared Dubai path constant and route helper used by `localePath` and language switch; canonical metadata uses the same helper. Add explicit single-hop alias redirects.
- [x] Add typed Dubai/Oman/Kenya configuration, product slugs and quote context; keep verified company facts in `site.ts`.
- [x] Run unit tests to green and `pnpm check` before committing.

## Task 2: Four T7 pages and connected journeys

Files: create four `[lang]` route leaf files; `src/components/locations/LocationPage.tsx`, `LocationHero.tsx`, `LocationFulfilment.tsx`, `LocationProducts.tsx`, `LocationSupport.tsx`, `LocationAdd.tsx`, `location-page.css`; modify English/Arabic dictionaries, hub links, route registry and existing map motion only as necessary.

Interface: `LocationPage({ market }: { market: "dubai" | "oman" | "kenya" })`; `locationMetadata(market)` returns localized Metadata. Route leaves select market. Server sections consume the matching dictionary entry and typed config. Product-add leaf receives slug/name/labels plus typed quote context and dispatches context only on user action, never on page load.

- [x] Write focused Playwright tests for four retained routes, truth/fulfilment distinctions, Dubai visit preview guard, both country quote presets, product-add context retention, titles/canonical/hreflang and both language switch directions.
- [x] Run tests red against the baseline production preview.
- [x] Arm the native design gate for the new page build. Write localized copy first; reuse the approved T7 structure, catalogue cards and factual data.
- [x] Implement the shared server template and tiny product-add leaf. Keep files focused, about 150 lines or less. Add page-specific tokens only where existing ones do not cover a required value.
- [x] Reuse existing map domain motion with page-local scoping and once-only visibility behaviour; explicitly test reduced motion, off-screen pause and no-JS content.
- [x] Connect Dubai/Oman/Kenya hub links; mark all four registry entries built in the same implementation commit.
- [x] Run focused tests green after production build.

## Task 3: QA, review and delivery

Files: `tests/e2e/location-pages.spec.ts`, `README.md`, new scoped design-check report under `docs/design-checks/`; update this checklist.

- [ ] Check 320, 390, 768, 1024, 1440 layouts; English/Arabic screenshots, keyboard walkthrough, hero/CTA hover contrast, all routes axe zero, no-JS and reduced motion.
- [ ] Run copy lint, native gate (maximum three rounds; stop and report OFF/ERROR per skill), preserve raw findings and fix genuine defects without weakening tests or the checker.
- [ ] Request independent final source/diff review; resolve genuine findings.
- [ ] Run `pnpm check`, `pnpm format:check`, `pnpm build`, full `pnpm e2e`, isolated performance checks.
- [ ] Record doc chapters, facts, decisions and exact test/audit limits; commit, push separate branch and create dependent PR without merging main.
- [ ] Start production preview, confirm 200 response, open it in Codex and wait for green CI before final delivery.

## Execution evidence

Branch `codex/location-pages` is based on the completed Locations hub (`ab763d8`), which remains PR #4. Routing foundation: `ed0b7c1`. Baseline 84 unit tests; final check 89 tests, lint and types pass; format check and production build pass. Full production browser suite: **295 passed, 15 existing viewport exclusions**. Includes all four retained T7 routes, Arabic export variants, 320/390/768/1024/1440 reflow, canonical/hreflang, both Dubai language switch directions, quote context preservation, guarded contact, no-JS, reduced motion and keyboard focus.

Independent source review found one Important locale-root query/hash bug, verified RED then GREEN; no deferred minors. UI audit fixes were also verified RED then GREEN for the phone hero and tablet nav. Native audit is **GATE: OPEN 29**, not PASS. Exact scope, raw evidence and new named exceptions pending explicit acceptance are in `docs/design-checks/location-pages-decisions.md`.

Ruling: reuse the existing AddToQuote client leaf with optional typed context instead of a separate cloned LocationAdd. It retains the working focus transfer and quantity announcements; the full suite verifies shared behaviour.

Isolated performance: 18/18 passed (three throttled mobile measurements per retained T7 page and both homepages). T7 maximum LCP 1.284s, CLS 0.0095, transfer 486,781 bytes; zero external requests or page errors.
