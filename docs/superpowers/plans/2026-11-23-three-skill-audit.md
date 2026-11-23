# Three-skill audit of the later pages (23 Nov 2026)

The homepage and the templates built by 22 Nov had full passes of all three skills (README → "Site-wide polish").
The pages built after that only inherited the shared system. This pass audits them with the skills themselves, in
order, and fixes what they find:

1. **Taste** (`design-taste-frontend`): layout, one section per screen, equal edges, imagery, the dealt moment,
   copy. Tools: `gate.mjs` and `copy-lint.mjs` on the built page.
2. **Impeccable** (`impeccable`): audit, then harden, adapt and polish: responsive at 320–1440, Arabic and RTL, long
   and missing data, focus and keyboard, contrast, performance.
3. **Emil** (`emil-design-eng`): interactions: hover and press on every control, timing and easing tokens, transform
   origins, the moment's choreography, reduced motion.

Durable plan and progress log: if a session or worker restarts, resume from this file and the pushed branches.
Every agent commits and pushes after each step and ticks its box here in the same commit.

## Branches and scope

| Branch                     | Agent | Pages                                                                                                                       |
| -------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------- |
| `claude/three-skill-audit` | —     | Integration; PR to `main`                                                                                                   |
| `claude/audit-locations`   | A     | `/locations`, `/zkteco-distributor-in-dubai` (`/ar/zkteco-dubai`), Oman, Kenya                                              |
| `claude/audit-company`     | B     | `/about`, `/services`, `/support`, `/privacy-policy`, `/terms-and-conditions`, `/blog`, `/blog/[slug]`, **the footer**      |
| `claude/audit-solutions`   | C     | `/solutions/{access-control, entrance-parking, door-locks, pos}`, `/software`, `/software/[slug]`, the shared `ProductCard` |

Out of scope (the user postponed them): a moment for the `/solutions` hub, and the `/software` hub's entrance.

## File ownership

- Each agent edits only its own pages' files and components, plus its namespaces in `en.json`/`ar.json`.
- Agent B also owns `src/components/shell/Footer*.tsx` and the footer's styles. Agent C also owns
  `src/components/catalogue/ProductCard.tsx` and `catalogue.css` (shared with the location pages).
- Shared files nobody edits: `src/app/globals.css`, `src/components/ui/*`, `src/components/home/*`,
  `src/components/signature/*`, the header. A fix needed there goes in your findings file as "for the integrator".

## Progress

### Agent A: locations

- [ ] Taste: gate + copy-lint on each page; findings in `docs/audits/2026-11-23-locations.md`
- [ ] Impeccable: audit; findings added
- [ ] Emil: interaction review; findings added
- [ ] Fixes (P0 and P1 at least), each committed
- [ ] Re-run the gate and specs; results recorded

### Agent B: company, legal, blog, footer

- [ ] Taste: gate + copy-lint on each page; findings in `docs/audits/2026-11-23-company.md`
- [ ] Impeccable: audit; findings added
- [ ] Emil: interaction review; findings added
- [ ] Fixes (P0 and P1 at least), each committed, including the footer (a Blog link is missing)
- [ ] Re-run the gate and specs; results recorded

### Agent C: solutions and software

- [x] Taste: gate + copy-lint on each page; findings in `docs/audits/2026-11-23-solutions.md`
- [x] Impeccable: audit; findings added
- [x] Emil: interaction review; findings added
- [x] Fixes (P0 and P1 at least), each committed, including the Arabic `ProductCard` spec values flush to the edge
- [x] Re-run the gate and specs; results recorded

### Integrator

- [ ] Merge the three branches; apply "for the integrator" fixes to shared files
- [ ] Visual check at 390 and 1440, EN and AR
- [ ] Full e2e once, performance budget
- [ ] README → Decisions; PR to `main`; merge on green CI
