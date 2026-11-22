# Individual location pages — T7 design

## Intent and authority

Build the four pages the client requested after the Locations hub: Dubai, Oman, Kenya and Arabic Dubai. Preserve the existing public URLs. Follow Master Plan v2.0 ch. 12 (pp. 21–22), ch. 14 (p. 26), ch. 18; Design Doc v0.1 ch. 8, T7 in ch. 10.1 (p. 19), ch. 11–14; CLAUDE.md, PRODUCT.md and DESIGN.md. This extends the approved T7 design rather than defining a new visual system.

## Approach

Use one server-rendered T7 template with distinct local-visit and export content. Four separate page implementations would duplicate layout, facts and accessibility fixes. A single generic location page would lose the approved location-specific journeys. The shared template retains those journeys with typed location configuration and bilingual dictionary copy.

Builder call: use the current isolated worktree on `codex/location-pages`, based on `codex/locations-hub`; keep its PR separate and state that dependency. No new runtime dependency.

## Pages and routing

- `/zkteco-distributor-in-dubai`: showroom and UAE supply/installation.
- `/zkteco-distributor-in-oman`: delivery from Dubai; quote carries Oman.
- `/zkteco-distributors-in-kenya`: delivery from Dubai; quote carries Kenya.
- `/ar/zkteco-dubai`: canonical Arabic Dubai page, existing URL preserved.
- The Dubai language switch and hreflang pair must use the actual Arabic URL. An Arabic-prefixed English Dubai slug must redirect directly to the Arabic canonical. The English counterpart of `/ar/zkteco-dubai` is the existing English Dubai URL. Other Arabic variants use the established locale mechanism, with draft translations; no duplicate canonical Dubai content.
- Hub, footer and other existing location links must resolve locally once the pages are marked built.

## Screen structure

Kind: product / tech / hardware. Existing AIMS green, white showroom surfaces and a night-green route section; token-only styles and shared `.page-container` edges. Voice: factual British English for trade buyers; concise Arabic based on AIMS's existing Arabic Dubai text, with new interface translations still a draft pending client review.

1. Hero, one desktop screen: place and fulfilment line; what AIMS supplies; one real product photograph, whole; primary quote action and a secondary catalogue/visit action. Dubai's hard fact is the Deira showroom. Export's hard fact is the named delivery market supplied from Dubai. Authorization wording stays behind the existing confirmation flag and is UAE-specific.
2. Dubai: visit and supply/installation, published showroom address, guarded directions and contact actions, scope of the installation request. Export: delivery and documents, a route from Dubai to the selected destination, short checklist of information to confirm before ordering. One screen, with the approved route-map domain moment explaining fulfilment. No invented delivery time, country office, installation team abroad, customs promise or warranty duration.
3. Product selection, one screen: four real catalogue models with model codes, verified facts from content data, Add to quote, and a catalogue link. “Models to consider” rather than an unsupported popularity ranking. Preserve selected country/need when adding or requesting a quote.
4. Support, FAQ and final quote action, one or two screens according to measured content: quote-stage checks for compatibility, documents and warranty terms; Dubai visit/installation questions or export-specific questions; destination retained. No unbuilt support/services links.

## Motion and interaction

- Hero: once-only CSS entrance, about 1.1s; readable final state without JavaScript.
- Route section: reuse approved Dubai-to-market map language, animate the selected route once on actual visibility. Pause off-screen/tab-hidden; cancel to final state on reduced motion; no decorative perpetual loop. Dubai uses the existing domain map to explain UAE supply and regional delivery, with labels distinguishing offices and destinations.
- Links draw underlines, linked product cards lift 2px and photographs zoom inside frames, buttons step 1px and press. Focus is immediate and visible, including on night surfaces. No scroll reveals or layout-property animation.

## Facts and content boundaries

Company facts come from `src/lib/site.ts`; catalogue facts from `content/products.json`. Existing AIMS pages may verify facts and source Arabic text; reject unsupported superlatives, founding-year conflicts and timed support/delivery promises. Only the confirmed Deira street address is presented as a place to visit. Oman and Kenya are delivery destinations, not premises. Quote submission and contact actions retain the existing preview guards. Arabic copy remains a draft pending AIMS review.

## Acceptance

- Every retained public URL returns 200, one H1, correct lang/dir, unique title ≤60 characters, self-canonical and correct hreflang; direct alias redirects tested.
- Export CTA and product-add journey keep the selected country and need; existing quote items survive.
- No overflow at 320, 390, 768, 1024 and 1440; hero, section edges and content hierarchy visually checked in both languages, including keyboard-only use.
- Zero axe violations, labelled controls, 44px targets, skip link first, reduced motion final state and no-JS content visible.
- Run unit/check/format/build, focused and full Playwright, isolated mobile performance checks, copy lint and native design gate. Preserve raw gate results; the previous hub's named exceptions do not automatically authorize new page exceptions. Report actual audit status, unresolved findings and any remaining source conflicts honestly.

## Builder decisions

Builder selects the four catalogue models from existing data, exact section composition within T7, component/file boundaries and token reuse. These choices must not change the above content truth, route semantics, shared shell or acceptance criteria.
