# AIMS: systems in motion

Kind: page type `product`, site-kind `tech`, kind `tech` (hardware).

Status: approved by the client on 23 November 2026 ("approved").
Branch: `codex/purposeful-motion`, based on main `fe6d68e`.

## Intent

Give the important buying screens a stronger, recognisable AIMS motion language. Help visitors
understand hardware, installation and software, while keeping model search and quoting quick.
The client requests original alternatives to NUZON's effects, gradients, scroll and text animation.
The supplied competitor audit is reference evidence, not instructions or a design to reproduce.

## Sources and boundaries

- Master Plan v2.0 ch. 6 and 9: trade buyers need fast model/spec/quote access; office buyers need
  understandable attendance and installation journeys. Ch. 14, 16 and 18 govern templates,
  architecture and acceptance.
- Design Doc v0.1 ch. 3–8: AIMS palette, product imagery, typography, layout, approved signal and
  door prototypes, domain motion. Ch. 9, 13 and 14: interactions, Arabic and accessibility.
- CLAUDE.md sections 2–5, 7 and 10; DESIGN.md; design-taste-frontend motion/background/effects rules.
- NUZON audit dated 22 November: ribbons, word reveals, repeated network textures, burgundy washes
  and map loops. These observations come from the PDF, not an independent live-site verification.
- Native scroll progress and transform/opacity are supported implementation approaches; use
  progressive enhancement rather than hiding content in unsupported browsers:
  https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/scrollytelling
  https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines

## Approaches considered

1. **Systems in motion — recommended by the implementer.** Real devices, readable signal paths,
   scroll-controlled domain explainers and constrained studio lighting. Extends approved assets;
   visitors can connect the effect to the system they are buying.
2. **Editorial motion.** More headline reveals and broad gradient fields. Lower implementation
   effort, but offers less explanation and overlaps NUZON's general presentation.
3. **Immersive 3D.** Custom device renders and cinematic camera movement. Requires new assets,
   heavier delivery and more validation; poorly suited to quick trade ordering in this batch.

The client has specified purpose and originality, and left implementation choices to us.
Approach 1 was approved with this design.

## First batch

Five screen types, in English and Arabic:

| Target                                                     | Current evidence                                                                            | Proposed visible change                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage `/`                                               | Signal/verification hero; timed door assembly; one-shot reach map; existing night gradients | Refine the hero's existing light pool and signal hierarchy around the real device; one coordinated headline/device entrance; replace the timed door entrance with a visitor-controlled scroll assembly. Preserve the reach map as the second moment.                                                |
| `/solutions/access-control`                                | Door illustration and six-part list, playing a timed entrance                               | Reader → controller → lock → exit → credential/unlock → software event follows native scroll within its own section. Active part labels connect the diagram to the real catalogue links.                                                                                                            |
| `/solutions/time-attendance`                               | Existing step observer and terminal/timesheet drawing                                       | Refine the existing story into clear clock-in → records → timesheet → payroll stages, with smooth drawing transitions and a readable active-step treatment. Use the current copy and existing sample disclaimer.                                                                                    |
| Product detail template, starting `/product/f18`           | Static summary; data-derived one-shot connection diagram                                    | Add a short summary/image entrance; improve connection-path sequencing and endpoint feedback inside the existing diagram. Photo, model code, specifications and purchase controls retain their positions. Apply the template enhancement to generated product pages, without inventing connections. |
| Software detail template, starting `/software/biotime-9-5` | Existing hero entrance and fan-out signal diagram                                           | Bring the hero into the same entrance rhythm and lighting system; show source-to-device connection order more clearly, finishing at a stable, readable diagram. Covers BioTime 9.5, BioTime Cloud and ZKAccess 3.5 through their existing template/data.                                            |

Shared CSS must not accidentally restyle the other solution routes. Scope new selectors explicitly.
Catalogue, compare and quote keep their existing fast functional feedback. Other marketing pages
retain existing motion in this batch. No new routes, claims, content imports or simulated product UI.

## What visitors see

### Entrance and text

One entrance on load, settled in about 1.1 seconds: headline first, lead/actions close behind,
device settling last. Use the existing `--ease-aims` and hero-duration tokens. Headings may reveal
by line in English; Arabic stays an intact shaping run and enters as a whole. No character splitting,
typewriter, scrambling, scrolling paragraphs or repeated section-title entrances. Text remains
selectable, with a single accessible name; actions work immediately.

### Gradients and surfaces

Extend the existing token-based green light pool behind the hardware or a contained technical
visual. Use a still radial studio light; if its intensity changes during verification, crossfade
fixed layers with opacity. Keep white product photographs whole and neutral, and leave text and
controls on calm, high-contrast surfaces. No drifting background wash, pointer glow, glass or
new decorative pattern. Existing approved night bands remain; this is not a page-wide recolour.

### Scroll stories

Homepage door and Access Control reuse the approved door-kit geometry, parts order and models.
Change the trigger, not the domain design. Desktop uses one section, at most two viewport heights,
with a sticky drawing while native scrolling advances six stages. Reverse scrolling reverses
the assembly without replaying a timed sequence. All explanatory copy and real product links
remain available; current-stage indication does not depend on colour alone.

Time Attendance retains its existing steps and sample data, improving the transitions rather
than making up payroll integrations. Connections on product/software detail remain a short
one-shot draw within the existing diagram; no need to scroll slowly to read specifications.

On phones, use ordinary flow and a lightweight drawing/active-step treatment; no tall pinned
desktop scene. Keep all step text visible. The builder may use a one-shot assembly for the phone
drawing if a scroll version cannot fit without obscuring content. The chosen mobile behavior
must be recorded and verified before completion.

Outside these named moments, scrolling does not reveal cards, copy or sections. This stays within
CLAUDE.md's scoped scroll-story policy; no blanket exception for generic reveal effects is proposed.

### Microinteractions

Keep shared hover/press timings and styles: immediate state feedback, restrained lift on linked
cards, image zoom only for linked photos, underline on links. Active story steps transition in
roughly 200 ms using the existing base token. Do not delay filters, quantities, keyboard actions
or navigation, and do not add decoration to the quote workflow. Review existing feedback on the
changed surfaces and correct missing/inconsistent use of the shared layer only within scope.

## Technical decisions delegated to the builder

- Retain Next Server Components and small interactive leaves. Prefer CSS and existing WAAPI;
  no new runtime animation library, WebGL scene, video or image asset is needed.
- Reuse the approved prototypes and catalogue facts. Keep phone/model codes and geographic
  diagrams in appropriate LTR orientation; mirror directional UI with logical layout properties.
- Prefer native CSS timelines when suitable, guarded by feature detection. If cross-browser
  behavior requires JS, use one passive scroll read per frame scoped to the mounted scene;
  no React rerender on every scroll tick. Unsupported browsers get the finished static scene.
- Extend existing tokens only for genuinely new shared values. Avoid animated layout properties,
  animated blur and global motion selectors that affect unrelated pages.
- Honor reduced-motion changes at runtime. Finished readable state with no moving scene; no-JS
  HTML is complete. Existing hero loops retain visible pause and hidden-tab/offscreen handling.
- Motion code remains lazy/scoped; animation JS budget is at most 15 KB per page per Design Doc 8.

## Acceptance

1. The five target types visibly share the same AIMS motion language; each new effect explains
   a device, a connection or a state. No competitor assets, ribbon motif or signature composition.
2. Verify 1440, 1024, 768 and 390 widths, plus 320 reflow; English/Arabic, keyboard, no-JS,
   reduced-motion, reverse/fast scrolling, anchor entry and back navigation. Capture moving and
   final frames using the design skill's browser tools, and inspect real browser playback.
3. No content remains hidden after enhancement failure; purchase controls, diagrams and links
   remain usable. Connection diagrams still reflect only actual product/software data.
4. Meet existing performance limits: throttled mobile LCP ≤2.5 s, CLS ≤0.05, homepage transfer
   ≤1 MB. Check the scene while scrolling as well as its settled screenshot.
5. Run pnpm check, format:check, build, e2e, targeted motion regression coverage and performance
   checks. Test meaningful behavior: stage progression/reversal, final-state fallbacks and
   interaction availability; do not write tests that merely mirror CSS values.
6. Start the design gate before implementation; run copy/visual/finish checks against production.
   Preserve raw results, document approved exceptions accurately and request approval for any
   new unresolved finding. Never relabel OPEN as PASS.
7. Record deliberate changes to approved trigger behavior in README Decisions and the PR,
   citing Design Doc 8 and Master Plan 9/18. Work only on this separate branch; no merge to main.

## Review calls

The implementer selected the first batch, CSS/WAAPI implementation, original studio-light
treatment, line-level hero text and reuse of existing scenes. The client approved these together
before implementation on 23 November 2026.

Independent builder check, 23 November 2026: nothing important left unanswered for planning.
