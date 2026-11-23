# Site-wide polish: progress log

Branch: `claude/blissful-goldberg-rhevpy`. Approved by the client on 23 Nov 2026 (full plan, all phases, push after
every commit, mixed models). Skill: `design-taste-frontend` (page type product, site-kind tech). This file is updated
with every push so a new session can resume exactly where work stopped.

## Rules for every step

- Content, routes, URLs, data, quote logic and the approved prototype animations do not change.
- Small commits; `pnpm check` passes before each; push after each.
- Anything that changes content or breaks a CLAUDE.md rule stops for the client's approval.

## Phases

| Phase | Scope                                                                                         | Model  | Status    |
| ----- | --------------------------------------------------------------------------------------------- | ------ | --------- |
| Setup | Server, gate armed, before screenshots                                                        | -      | started   |
| 0     | Duplicate token, shared CSS into `ui/`, `.wrap` alias, waivers                                | Sonnet | done      |
| 1     | Shared `PageHero`, `Section`, `SectionHeader`, `ClosePanel`, `Faq`, `OfficeCard`, `ReachBand` | Opus   | done (1a) |
| 1     | One button set, one card and panel, one link look, type scale (h1 68/52, h2 38, h3 24)        | Opus   | -         |
| 2A    | T5 product redesign, T4 listings                                                              | Opus   | -         |
| 2B    | T2 solutions hub, T3 solutions, T7 locations                                                  | Sonnet | -         |
| 2C    | T6 software, T10 editorial, T9 contact, T8 quote                                              | Sonnet | -         |
| 3     | Motion and rule fixes (ta-punch pause, floating contact, pick-card zoom, RTL arrows, targets) | Sonnet | -         |
| 4     | Gate and checker at 1440/1024/768/390, Arabic, keyboard, perf, README Decisions               | -      | -         |

## Audit baseline (consistency.mjs --quick, 1440 and 390)

Home 48 (gate) · Product f18 75 · Solutions hub 74 · Access control 72 · About 72 · Contact 66 · Products 56 ·
BioTime 9.5 56.

## Log

- 23 Nov 2026: audit done, plan approved, progress file created.
- 23 Nov 2026: Phase 0 done. Dropped the shadowed `--text-page-title` pair; moved rules shared by two or more families into `ui/sections.css` (loaded from the layout; `ed-copy-in` replaced by `t3-copy-in`), which let 12 pages drop `home/sections.css` and 9 drop `solution/solution.css`; renamed the `page-container` utility to `wrap` (src, tests, README, waivers). Pages render pixel-identically at 1440 and 390.
- 23 Nov 2026: Phase 1a done. One shared component each in `src/components/ui/`: `PageHero` (split and compact, `data-enter` and the one `.hero-enter` entrance on every page; the product summary enters too), `Section` (paper, band, night) with the one `--section-space` token, `SectionHeader`, `ClosePanel` (mint, night), `Faq` (native disclosures, answer reveal everywhere), `OfficeCard`, `ReachBand`, and `MomentTrigger` moved from home. Deleted: LocationIntro, CompanyIntro, EditorialIntro, SoftwareHero, SolutionCta, CompanyClose, SoftwareClose, HomeClosing, ContactReach, LocationReach, contact.css, and every duplicate CSS block they used. `SolutionIntro`, `HomeFaq`, `SolutionFaq`, `SolutionQuestions`, `LocationOffices` and `LocationCards` stay as thin data adapters onto the shared blocks. Open for the client: /support's hero keeps its three published actions (WhatsApp, email, contact page), one over the two-action rule. Note: after editing `globals.css`, run `rm -rf .next` before `pnpm build`; the Turbopack cache once kept the old tokens.
