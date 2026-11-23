# Locations design gate reconciliation

Client approval: 22 November 2026, “Expand to resolve shared rules”. The stock skill remains unchanged. Its third initial run is `GATE: OPEN 43`; expanded shared-shell work is a new scope and gets a fresh gate run. No stock gate PASS is implied.

## Project-specific decisions

- `phone-number`: the four published AIMS telephone lines, whether in office cards, footer or mobile menu, are required facts in `src/lib/site.ts`. CLAUDE.md explicitly requires those real contacts. They are not fictitious businesses reaching strangers. ContactGuard still intercepts actions in preview. Replacing them with fake numbers is forbidden.
- `effect-kind` and `scroll-reveal` on `section#delivery` / `.reach-map`: Design Doc 8.3 specifies Dubai export routes, and CLAUDE.md explicitly prioritizes approved domain animations over generic kit effects. Six paths draw once when the actual map enters, pause offscreen, and stop under reduced motion; dedicated browser checks verify this. The generic checker knows only its own moment catalog. Its “true” rendering of an empty boolean attribute is not an unmounted third-party module.
- `copy-headings` on “UAE offices and showroom” and “GCC destinations”, and `copy-fact` on the hero: UAE, Dubai, Deira, GCC and Africa are literal supplied place names and scope. They satisfy a location hub even if the generic noun/place vocabulary does not recognize them.
- Directory-shell classifications (`button-styles` on popular-search chips, `one-heading` on footer navigation column headings, `row-lines` / `split-pair` on the footer directory): these are the existing Design Doc ch. 6 navigation and search controls. Chips are alternate searches; column headings are independent nav landmarks, not additional marketing sections. They must remain reachable and readable in English and Arabic.
- `button-styles` includes the lime night CTA: it has the same pill dimensions, weight and interaction as the light CTA. CLAUDE.md explicitly permits lime actions on night surfaces at ≥4.5:1. Its dark text remains on lime on hover; axe now checks that hovered state.
- `container-edges` only for `footer.closing > .wrap` and the four footer navigation column headings, and `off-grid` only for footer popular-search chips: the footer has the specified directory, popular searches and legal row. Its column headings belong to their nav landmarks and its chips wrap at intrinsic text widths. The outer content box aligns with the rest of the site; the columns and chips are not marketing headings required to start on the outer edge.
- `section-height` on `main#main > section.locations-hero` and `one-section` at the hero/UAE boundary: the sticky header occupies 73px of flow; the hero occupies exactly the remaining viewport and the UAE section begins at scrollY 900 at 1440×900. The checker starts its first tile at the hero's y73, effectively counting the header twice. The first real screen shows only the hero below the header. `one-section` at the delivery/footer boundary similarly uses the maximum-scroll footer position, not a new marketing section; verify the page section edges independently.
- The footer's `section-height` content-fit message assumes 72px bottom padding. The actual shared footer uses `pb-8` (32px); its last row ends inside that padding. It remains in normal flow and no content is clipped.
- `section-height` on the directory footer and `section-gaps` between its directory and delivery content: the shared directory grows with its contact and navigation content, especially in Arabic. Clipping it to an exact viewport would hide links. Reflow, visible focus and touch target requirements take precedence. The marketing page itself retains screen rhythm.
- `no-visual` on `section#uae`: this is the T2 address/contact directory required by Master Plan ch. 12 and Design Doc ch. 9, with real location icons. AIMS has not supplied premises photographs. A product image would not locate the offices; a stand-in building could imply an invented office. Keep the useful address directory and request actual premises photography from AIMS.

## Defects fixed during reconciliation

- The shared container now exposes its actual 1280px content box; desktop and mobile content edges remain at the same visual positions. Shared and page wrappers use the same geometry.
- The header search has a visible label and retains its keyboard and screen-reader name.
- The wordmark full stop is a decorative SVG circle rather than low-contrast text. The AIMS letters remain text.
- Night-surface destination focus uses lime with sufficient contrast.
- The hero uses the existing trimmed AIMS product photo, not a small product surrounded by white image padding.
- FAQs share the contacts section instead of a separate nearly empty screen; office cards have location icons.

## Remaining evidence

**Audit provenance after upstream integration:** OPEN29 and the raw files below were captured from the Locations working tree based on 4f6d521, before the subsequent main merges. Main c433994 later changed the footer to disclosures and added site-wide polish; its current DOM is not represented by those historical 29 findings. A final refresh returned `GATE: OFF (no build active)`. The skill explicitly says to report OFF and not rerun. No fresh stock-gate PASS or current OPEN29 count is claimed. Current integration evidence is the fresh 253-check browser suite (15 existing viewport exclusions), 84 unit tests, source review, formatting and production build; the named project policy and raw historical audit remain reviewable.

The complete unmodified gate log is preserved in `locations-raw-gate.txt`, including layout-check findings. `locations-raw-findings.json` contains the consistency checker's unmerged per-viewport records.

Layout-check `edge-left` / `edge-right` only on `footer.closing` directory columns are the same directory-column classification above: these are columns inside the full-width wrap, not blocks intended to span its entire width.

Layout-check `screen-height` on `#uae` and `#delivery` reports “900px, 1.09 screens” at a 900px viewport because it subtracts the sticky header from its reference screen. The actual page sections are 100svh (900px), and the browser check verifies the UAE block ≤902px at 1440×900. The other checker in the same gate accepts those actual section heights. At phone sizes the contact directory grows in normal flow to keep three addresses and their answers readable, as the T2 single-column/reflow requirement specifies.

Expanded raw gate: `GATE: OPEN 29 (rounds used up)`. The unchanged checker output is preserved in `locations-raw-findings.json` with exact selectors, messages and viewport widths. Its remaining contact, approved-motion, place-noun, directory-shell and sticky-header boundary findings map to the decisions above. No raw PASS is claimed. New genuine defects are not accepted by these decisions. Any additional exception must name the concrete finding and be reviewed in the PR.

The full production suite passes 168 checks with ten existing viewport-specific exclusions and zero axe violations. The hover-specific contrast regression was reproduced as a failing axe check and then corrected; its final rerun is recorded in the PR. English/Arabic layouts were captured at 390/768/1024/1440, with 320px reflow checks. The original uncommitted software work remains outside this worktree.
