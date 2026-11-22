# Solutions Hub Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in the current session.

**Goal:** Build the user-selected T2 Solutions hub at `/solutions` and `/ar/solutions` on `codex/solutions-hub`.
**Architecture:** Server-rendered page and small single-purpose sections, translated dictionaries, native linked cards and FAQ disclosures. Reuse the existing shell, catalogue imagery, breadcrumbs and metadata helpers. No new runtime dependency or page-specific JavaScript.
**Tech Stack:** Next.js 16.4, React 19, TypeScript, Tailwind 4, Playwright, Vitest.
**Spec:** User-selected Solutions hub; Design Doc v0.1 ch. 3–9, 10.1 T2, 12–14; Master Plan v2.0 ch. 6, 12, 14, 16, 18; CLAUDE.md.

## Design and scope

Use the supplied T2 blueprint, not a new visual direction: breadcrumb, H1 and lead, five cards with outcome and components, industries strip, FAQ. Cards use real imported product photographs. Desktop has a two-column grid; the final card spans the row. Mobile has single-column cards. Use the existing shared container and token typography, 96px desktop / 56px mobile section rhythm.

The approved hub is the appropriate approach. Building five T3 solution pages would exceed this one-screen request; a catalogue-only page would duplicate the existing listing. Preserve the already documented family-listing fallbacks, with explicit catalogue action labels. The optional P2 finder remains deferred. Industry names describe use cases, not customer or certification claims. Arabic remains draft copy.

## Global Constraints

- Node 22 / pnpm 10; no new dependency. Keep page and sections Server Components.
- Tokens only, logical properties, one H1, native links/details, all UI strings in both dictionaries.
- Real imported photos; no invented specs, claims, numbers, customers or availability.
- Card image hover scale 1.04 desktop only, shadow-2; FAQ chevrons 320ms. Reduced motion removes transitions.
- No decorative loops or hub-specific hero gradients: neither is specified for T2.
- Minimum 44px targets; reflow at 320px; English/Arabic at 390/1440px; noindex, canonical metadata and breadcrumbs.
- Branch created from main and fast-forwarded to ee64aa8 to retain the homepage foundation. Existing branches stay unchanged. Continue in the current checkout as in the prior task.

## Review Focus

- All five cards reach built, localized catalogue destinations with accurate labels.
- Header and footer expose the newly built hub instead of the previous `/products` fallback.
- Long Arabic headings and 320px reflow do not overlap product images or escape the container.
- Keyboard can activate cards and toggle FAQs; reduced motion disables image/chevron transitions.
- Images have stable dimensions; the hub adds no client animation module or external runtime requests.

## Task 1: Build and connect T2

**Files:** `src/app/[lang]/solutions/page.tsx`, `src/components/solutions/{SolutionCard,SolutionIndustries,SolutionFaq}.tsx`, `src/components/solutions/solutions.css`, `src/content/solutions.ts`, `src/i18n/messages/{en,ar}.json`, `src/lib/{routes,navigationHref}.ts`, `src/components/shell/Footer.tsx`, `tests/e2e/solutions.spec.ts`, `src/lib/navigationHref.test.ts`.
**Interfaces:** Existing `getDictionary/getLocale`, `localePath`, `productBySlug`, `Breadcrumbs`, `alternates`; new `SOLUTION_CARDS` maps solution slug to family and example product; `SolutionCard` consumes its record and translated content.

- [x] Add tests for localized hub routes, five valid card destinations, metadata, keyboard FAQ, grid alignment/reflow, reduced motion and hub navigation. Update the navigation unit expectation; observe missing-route/fallback failures.
- [x] Implement the T2 page, five cards, industries and FAQs. Connect the hub in navigation and mark only `/solutions` built.
- [x] Run focused tests and inspect screenshots at 390/1440 in both languages. Fix observed failures.

## Task 2: Verify and deliver

**Files:** README.md, this plan; implementation files only for verified fixes.
**Interfaces:** Public hub URLs and existing production test commands.

- [x] Run `pnpm check`, `pnpm format:check`, `pnpm build`, full production `pnpm e2e`; zero axe violations.
- [x] Independently review the change against both PDFs and CLAUDE.md; resolve findings.
- [x] Record scope decisions and verification, commit with chapter/AT references, push branch. (PR into main: not opened yet; waiting for the go-ahead.)

## Progress

- Relevant source docs, rendered T2 specification, local Next guides and existing shell/catalogue interfaces reviewed.
- Branch: `codex/solutions-hub`; baseline: `ee64aa8`.
- Review fixes: card link restructured (axe `label-content-name-mismatch` on /solutions and /ar/solutions, both
  viewports); component lines corrected to match the linked listings; hub axe tags aligned with the smoke test.
- Verified: `pnpm check` (60 unit), `pnpm format:check`, `pnpm build` (353 pages), `pnpm e2e` 105 passed / 0 failed,
  0 axe violations; screenshots at 390 and 1440 in English and Arabic; keyboard focus outlines the whole card.
