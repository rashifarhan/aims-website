# Kind: product / tech — Locations hub

**Goal:** Build T2 `/locations` in English and Arabic, in isolated `codex/locations-hub`.
**References:** CLAUDE.md, PRODUCT.md, DESIGN.md; Master Plan ch. 12/14/16/18; Design Doc ch. 6/8.3/9/10.1/13/14; repository design-taste-frontend skill.

User approved the Locations hub and isolated worktree. Base is the current committed foundation, excluding all uncommitted software work. Keep the existing shell and tokens. Voice: facts only; published contacts, no delivery promises or invented premises.

## Design

Hero: security systems in UAE and abroad, one-screen introduction with real terminal photography and a UAE/export choice. UAE: three published office/showroom cards; only Deira has an exact supplied address/map. Markets: GCC and Africa destinations with a destination preset into the existing quote list. Export notes and FAQ remain concise. Domain moment: Design Doc 8.3 route lines from Dubai (reuse ReachMap, once; static reduced-motion fallback). Hero enters once, links/cards respond on hover/press. Missing photographs of premises stay absent; product photographs do not imply premises.

## Tasks

User expanded scope on 22 November: reconcile shared header/footer rules and the gate policy. Keep raw checker results available, preserve required real contacts and approved motion, and distinguish genuine defects from checker assumptions that contradict CLAUDE.md. No blanket exclusions or hidden checker inputs.

- [x] Add failing flow tests: hub 200, localized navigation, 320px reflow, keyboard links, country carried into quote form, zero axe.
- [x] Implement server-rendered sections and localized copy; small motion leaf and URL preset parser; mark hub built.
- [x] Inspect at 390/768/1024/1440 in both languages; reduced motion and keyboard checks.
- [x] Run check/format/build/full e2e, design copy lint and gate; record waivers and limitations.
- [ ] Independent review; commit/push new branch and PR, leave preview available.

Verification: 75 unit tests, production build, full 168-check browser suite (10 existing viewport exclusions), six isolated performance checks pass. Final hover contrast fix reproduced red, then all six focused Locations checks passed. Raw design gate OPEN29, project findings resolved under the user-approved named policy; independent reviewer confirmed no unresolved genuine defects. Complete raw output is retained. No kit edits, new dependency or invented location facts.

Integration: rebased onto main eeeb551 after the homepage/contact/solutions merge. Kept main's optional WhatsApp-number argument and local contact route. Fresh integrated validation: 75 unit tests, formatting, production build, 183 browser checks pass with 11 existing viewport-specific skips. Independent integration review found no unresolved defects.
