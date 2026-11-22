# Remaining pages: port and polish (22 Nov 2026)

Durable plan and progress log. If a session or worker restarts, resume from this file and the pushed branches below:
nothing lives only in a container. Every agent commits and pushes after each step and ticks the box here in the same
commit.

## Branches

| Branch                    | Role                                                    | Owner      |
| ------------------------- | ------------------------------------------------------- | ---------- |
| `claude/remaining-pages`  | Integration; PR to `main`                               | integrator |
| `claude/locations-polish` | Locations hub + four T7 location pages                  | agent L    |
| `claude/company-polish`   | About, services, support, privacy, terms, blog (T2/T10) | agent E    |

Sources (read with `git show origin/<branch>:<path>`; never merge them wholesale):

- `origin/codex/location-pages` (contains `codex/locations-hub`): content, data (`src/lib/locationPages.ts`), the
  destination quote flow and tests are reusable. **Not taken:** its CLAUDE.md gate waivers, the kit class names added to
  the shared header and footer (`nav`, `wrap`, `closing`), the visible floating search label, the skip-link move and the
  `docs/design-checks/*` gate records. Those change the shared shell or the project rules to satisfy a checker; they need
  the user's decision, not an agent's.
- `origin/claude/editorial-pages`: privacy, terms and blog on the newer `main`, with AIMS's own blog images.
- `origin/claude/company-pages`: about, services, support (and its own privacy, terms, blog and a stopgap `/locations`
  that links to AIMS's live pages). Based on an older `main`. Its `/locations` is superseded by agent L's.

## Rules for both agents

- Work only in your worktree, on your branch. **Commit and push after every finished step** (a page, a component, a
  test file), with an imperative subject and a why-body ending in the session attribution lines. Never leave more than
  about 20 minutes of work uncommitted. Push with retries: `git push -u origin <branch>`.
- Tick your boxes below in the same commit as the work.
- Never force-push; never touch `main` or another agent's branch.
- CLAUDE.md non-negotiables hold: truth only from `content/*.json` and `src/lib/site.ts`; tokens only; logical
  properties; en/ar key parity; WCAG 2.2 AA; next/link; no `any`; components ≤150 lines; comments say why.
- Reuse the shared system (README → "Site-wide polish"): `src/components/ui/actions.css` buttons and `.ui-card*`,
  globals.css motion tokens, `MomentTrigger`, Breadcrumbs, catalogue `ProductCard`, signature animations (VERIFY,
  SIGNAL incl. `ReachMap`, UNLOCK). No second design system, no taste-kit markup.
- Motion (CLAUDE.md §3): the hero enters once; one dealt moment (two on a long page), plays once, rests on its final
  frame under reduced motion; the hover and press layer everywhere. Nothing reveals on scroll.

## Progress

### Agent L: locations (`claude/locations-polish`)

- [ ] Read the Codex branch; list what is ported and what is left, with reasons
- [ ] `/locations` hub on our system (replaces `navigationHref`'s `#showrooms` fallback)
- [ ] `/zkteco-distributor-in-dubai`, `/zkteco-dubai` (keep existing URLs and the locale pair; CLAUDE.md §6)
- [ ] `/zkteco-distributor-in-oman`, `/zkteco-distributors-in-kenya`
- [ ] Destination quote flow and its unit tests
- [ ] Routes flipped to built; e2e specs; `pnpm check` + build clean

### Agent E: company and editorial (`claude/company-polish`)

- [ ] Compare both editorial branches; choose one editorial system and one importer
- [ ] `/privacy-policy`, `/terms-and-conditions`
- [ ] `/blog`, `/blog/[slug]` with AIMS's images
- [ ] `/about`, `/services`, `/support` (services and support stop falling back to `/contact`)
- [ ] Routes flipped to built; e2e specs; `pnpm check` + build clean

### Integrator

- [ ] Merge both branches into `claude/remaining-pages`; resolve en/ar with the three-way merge
- [ ] Visual check at 390 and 1440, EN and AR; route sweep
- [ ] Targeted e2e, full suite once, performance budget
- [ ] README decisions; PR to `main`; merge on green CI
