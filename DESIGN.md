---
name: AIMS Security Systems
description: The ZKTeco specialist you can visit, verify and order from with confidence.
colors:
  aims-green: "#26703a"
  aims-green-deep: "#1b5e20"
  showroom-mint: "#eef6f0"
  mint-hairline: "#d9ecdf"
  reader-lime: "#78be20"
  ink: "#0e1512"
  ink-soft: "#26302b"
  ink-secondary: "#4a5550"
  ink-muted: "#666f6a"
  hairline: "#e1e9e3"
  control-border: "#7c8781"
  paper: "#ffffff"
  showroom-floor: "#ffffff"
  showroom-band: "#f7faf8"
  showroom-floor-deep: "#eef1ee"
  night-deepest: "#06100a"
  night: "#0a1a10"
  night-raised: "#102619"
  night-glow: "#18352a"
  night-hairline: "#24432f"
  night-text: "#e9f2ec"
  night-muted: "#a9bdb0"
  error: "#b42318"
  warn: "#8a5300"
  whatsapp: "#128043"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 680
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 680
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 680
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.3
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.90625rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.45
  model-code:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.45
  arabic:
    fontFamily: "IBM Plex Sans Arabic, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  xs: "5px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.aims-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "54px"
    padding: "0 28px"
  button-primary-hover:
    backgroundColor: "{colors.aims-green-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
  button-night:
    backgroundColor: "{colors.reader-lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "54px"
    padding: "0 28px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.aims-green}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  text-link:
    textColor: "{colors.aims-green}"
    typography: "{typography.label}"
  card-product:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-night:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-search:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  chip-selected:
    backgroundColor: "{colors.showroom-mint}"
    textColor: "{colors.aims-green-deep}"
    rounded: "{rounded.pill}"
---

# Design System: AIMS Security Systems

## Overview

**Creative North Star: "The Trusted Showroom"**

AIMS is a ZKTeco distributor you can walk into, and the interface behaves like its Deira showroom. The page is a bright
white showroom floor, its alternate bands a barely-green tint. Real products stand on white lifted cards like display
plinths, each named by its model code. AIMS green is the sign over the door: it marks what you can act on and almost
nothing else. When the story needs drama, the page turns to the showroom after hours: deep night-green surfaces where
lime becomes the light at the reader, the one moment a credential is accepted.

Density follows the visitor. Marketing surfaces are spacious, with one idea per screen and the product shown big. The
catalogue, compare and quote surfaces are exact and Swiss: tabular figures, hairlines, mono model codes, nothing
decorative between the buyer and the spec. Motion exists only to show how access and attendance work (credentials
reaching a reader, a door kit assembling, a punch becoming a timesheet) or to answer a pointer.

Rejected, on the evidence of aimsuae.me and NUZON: a manufacturer-branded header, stock "consulting" and "ACCESS
GRANTED" photographs, carousels, the same green button repeated four times in a row, a secondary blue, glassmorphism,
blobs and burgundy ribbons.

**Key Characteristics:**

- Light showroom floor, white lifted product cards, real cut-outs on white.
- One action colour (AIMS green); lime only as light, never as body text on light surfaces.
- Night-green sections for the after-hours moments; daylight for the catalogue.
- Model codes in IBM Plex Mono as the system's signature.
- Inter throughout, heavy-ish display weights (650–680), sentence case.
- Pill controls, gently rounded cards, hairline borders.

## Colors

A green-tinted neutral showroom with one confident green, one spark of lime, and a night-green ramp for drama.

### Primary

- **AIMS Green** (#26703a): every primary action (buttons, text links, selected states, focus rings) on light
  surfaces. White on it measures 6.07:1.
- **AIMS Green Deep** (#1b5e20): hover and pressed state of the primary; "done" states.
- **Showroom Mint** (#eef6f0) and **Mint Hairline** (#d9ecdf): selected chips and options, tinted surfaces (the
  showroom card, the full-width closing band), their borders.

### Secondary

- **Reader Lime** (#78be20): the light at the reader. Decorative on light surfaces (the wordmark's full stop, signal
  pulses, status dots; 2.29:1 on white, so never text there). On night surfaces it measures 5.8–8.5:1 and may carry
  links, figures and the night button.

### Neutral

- **Ink** (#0e1512): headings and body text (18.5:1). **Ink Soft** (#26302b): strong secondary text.
- **Ink Secondary** (#4a5550): leads, descriptions (7.76:1). **Ink Muted** (#666f6a): captions, meta, hints (5.19:1).
- **Paper** (#ffffff): cards, product photo plinths, fields, menus and the header. **Showroom Floor**
  (`--color-page`, #ffffff): the page ground, white since the client's decision of 24 Nov 2026 (it replaced the one
  mint ground). **Showroom Band** (`--color-paper-2`, #f7faf8): the faint green tint of alternate bands
  (`section-band`), the footer, wells and hover washes; on it ink-400 measures 4.94:1, ink-600 7.4:1, green-700
  5.8:1. **Showroom Floor Deep** (#eef1ee): spec tiles and the door-kit room.
- **Hairline** (#e1e9e3, green-tinted): dividers, band edges and card borders. **Control Border** (#7c8781): input and
  stepper borders (3.7:1 on white, 3.5:1 on the band; WCAG 1.4.11).
- **Night ramp** (#06100a → #0a1a10 → #102619 → #18352a, hairline #24432f): after-hours sections, from page ground to
  raised card. **Night Text** (#e9f2ec, 15.7:1) and **Night Muted** (#a9bdb0, 9.1:1) on them.
- **Status:** Error (#b42318, always with an icon and text), Warn (#8a5300, demo notices), WhatsApp (#128043, the
  WhatsApp button fill only, 5.01:1 with white).

### Named Rules

**The One Sign Rule.** AIMS Green marks what can be acted on and nothing decorative. If something green can't be
clicked, selected or read as a state, it shouldn't be green.

**The Lime Is Light Rule.** Lime is a light source, not a paint: wordmark stop, signal pulses, the reader LED, and text
only on night surfaces. Never a fill behind dark text on light pages.

**The No Second Accent Rule.** No blue, no violet, no burgundy. aimsuae.me's secondary blue was considered and rejected:
it competes with green as the clickable colour.

## Typography

**Display Font:** Inter (self-hosted variable, with ui-sans-serif, system-ui)
**Body Font:** Inter
**Label/Mono Font:** IBM Plex Mono (400, 500), for model codes, spec values and indices
**Arabic:** IBM Plex Sans Arabic (400–700), same scale with +0.1 line height and no letter-spacing

**Character:** Inter carries a confident, technical B2B voice at heavy display weights; Plex Mono makes every model
code read like a datasheet entry.

### Hierarchy

- **Display** (680, 4.5rem / 72px, 1.03, -0.04em): the homepage hero only; 3.5rem from 1024–1279px, 2.5rem on phones.
- **Page title** (680, 3.25rem / 52px, 1.05, -0.03em): H1 on hub and solution pages; 2.125rem on phones.
- **Headline** (680, 2.375rem / 38px, 1.12, -0.025em): section titles; 1.75rem on phones.
- **Title** (650, 1.125rem / 18px, 1.3): card and step titles.
- **Lead** (400, 1.1875rem / 19px, 1.55, Ink Secondary): the sentence under a title, at most 38rem wide.
- **Body** (400, 1rem / 16px, 1.6): text and every input (16px stops iOS zoom); prose at 65–75ch.
- **Label** (600, 0.90625rem / 14.5px): nav, buttons, text links.
- **Caption** (500, 0.8125rem / 13px): meta, counts, chips, tile labels.
- **Brand line** (600, 0.71875rem / 11.5px, 0.08em, uppercase): the "ZKTECO" line on product cards, the only
  all-caps text.

### Named Rules

**The Datasheet Rule.** Every model code is in IBM Plex Mono and stays left-to-right inside Arabic. Quantities, counts
and specs use tabular figures; units take a space ("12 V DC", "280 kg").

**The Sentence Case Rule.** Sentence case everywhere except the brand line. No trailing periods on buttons and labels.

## Layout

One shared container: 1280px of content inside 32px desktop gutters (1344px border box), 24px gutters below 640px.
Header, footer, hero copy and every section align to the same two content edges. The hero alone may run wider (a
1600px stage for the device and signal lines).

Grids: 12 columns with 24px gaps from 1024px, 8 from 640px, 4 below. Card rows use three columns on desktop, two on
tablets and phones for product families, one for everything else on phones. Breakpoints: 640, 1024, 1280.

Rhythm: sections pad 56px top and bottom on desktop (112px between sections) and 32px on phones; night sections double
it. Spacing steps are 4, 8, 12, 16, 24, 32, 48. Gaps inside a group stay smaller than gaps between groups.

Mobile first at 390px: if a view feels busy, remove things rather than shrink them. Sticky elements never cover a
focused field; scroll padding equals the header (60px mobile, 72px desktop) plus 16px.

## Elevation & Depth

Products are lifted, like products on a showroom plinth: every white card carries the green-tinted hairline border
and a soft two-layer shadow that falls only below it, and a linked card rises 2px on hover. Text-only content
(routes, software, reasons, steps) still stands on the ground as open rows under a hairline. Bands and panels separate
by tone (white page, faint band, night steps) and hairlines, never by shadow. Overlays (menus, dialogs, the compare
tray) float higher.

### Shadow Vocabulary

- **Plinth** (`--shadow-plinth`, client decision 24 Nov 2026: `0 1px 2px` night-800 at 4% plus
  `0 12px 32px -20px` night-800 at 18%, the negative spread keeping it below the card): every white `.ui-card` at
  rest.
- **Plinth lifted** (`--shadow-plinth-lift`: `0 2px 4px` night-800 at 5% plus `0 22px 44px -22px` night-800 at 26%):
  hover and focus on a linked card, with the 2px rise.
- **Lifted** (`--shadow-2`, `0 12px 32px rgb(14 21 18 / 0.08)`): popovers, search suggestions, the floating contact.
- **Floating** (`box-shadow: 0 24px 60px rgb(14 21 18 / 0.12)`): dialogs, the mobile menu sheet, trays.
- **Night card** (`box-shadow: 0 24px 48px rgb(0 0 0 / 0.35)`): cards on night surfaces; hover adds a lime ring
  (`0 0 0 1px rgb(120 190 32 / 0.55), 0 0 32px rgb(120 190 32 / 0.16)`).
- **Device** (`filter: drop-shadow(0 34px 40px rgb(14 21 18 / 0.22))`): the hero's dark device cut-out only.

Current code (24 Nov 2026): every white card in the shared `.ui-card` (product and family cards, solution options,
office cards) stands on the plinth; the home buyer routes and software are open rows; buttons carry no shadow or glow.

### Named Rules

**The Plinth Rule.** A card is a raised white plinth: the green-tinted hairline outline, the soft two-layer plinth
shadow below it, and a 2px lift with the lifted plinth shadow on hover (its photo zooms 1.02–1.03). Text that needs no
box sits in open rows, each under a 1px `--color-line` top rule, with the title, one line and an arrow text link.
Bands, tables, text and buttons never cast shadows.

**The Signature Rule.** AIMS's own motif is its signal lines (Design Doc 3): every inner hero carries them as a still
watermark (at most 18% green-700, faded before the copy, mirrored in RTL) under a soft green-100 light at its top,
and the home families band and journey carry faint arcs of the same fan (12%). Never dots, networks or ribbons, and
never motion outside the home hero.

## Shapes

Gently curved, never sharp and never blobby. Controls are full pills (buttons, search, chips, the quote link, steppers);
cards and panels round at 18px; inner tiles at 12px; inputs and small buttons at 8px; keycaps and tags at 5px. Nested
radius follows outer minus padding. Product images sit square on white inside the card, never on a tint. Explainer
drawings (the door kit, the attendance story, the reach map) share one line-art language: ink strokes of 1.5–2px,
line-strong wires, white pill labels with hairline leaders, green for actions and lime for signals.

## Components

### Buttons

- **Shape:** full pill (999px).
- **Primary:** AIMS Green fill, white label (600, 14.5–16px), 54px tall in heroes and 44–48px elsewhere, 28px side
  padding, an arrow icon that moves 3px toward the reading direction on hover.
- **Hover / Focus:** a Deep Green layer fades in (120ms); press scales to 0.98; focus shows a 2px AIMS Green ring with
  a 2px offset.
- **Night:** Reader Lime fill with Ink label on night surfaces; hover lightens it with a 20% white layer.
- **Secondary:** a green underlined text link beside the primary, never a second filled button. Outline pills (white,
  Control Border) for "Quote" in the header and dialog cancels.

### Chips

- **Style:** white pill, Control Border, Ink Soft label (13px, 500), 44px tall.
- **State:** selected turns Showroom Mint with an AIMS Green border and Deep Green label; removable chips name their
  filter for screen readers.

### Cards / Containers

- **Corner Style:** 18px.
- **Background:** Paper on light; Night Raised on night sections, with the product image area kept white.
- **Shadow Strategy:** the Plinth Rule (see Elevation & Depth): every white card, the lift on linked ones.
- **Border:** 1px Hairline (Night Hairline on night); the border darkens a step or turns Mint Hairline on hover.
- **Internal Padding:** 24px (20px on phones); image areas 24–28px.

### Inputs / Fields

- **Style:** label above (14px, 600), 48px control, 8px radius, Control Border, white fill, 16px text; hint below.
- **Focus:** 2px AIMS Green ring.
- **Error / Disabled:** Error border with an icon and a message linked by `aria-describedby`; an error summary that
  takes focus.

### Navigation

- **Desktop header:** 72px, sticky, white at 94% with blur, a 1px hairline under it. Wordmark, Products and Solutions
  mega-menus, Software / Services / About, a pill search field with a "/" key, the language switch, and an outline
  Quote pill with a count badge. A 1.5px green underline grows under nav words on hover (250ms).
- **Mobile header:** 60px with the wordmark, Quote and a menu button that opens a full-height sheet (search, accordion
  sections, Quote, WhatsApp, Call, language).

### Model-code tile (signature)

The datasheet look made reusable: a mono model code (13px, 500, Ink Muted or Ink) under or beside a product name, with
spec facts as small Showroom Floor Deep tiles (label in Ink Muted, value in 600 Ink, tabular figures).

## Do's and Don'ts

### Do:

- **Do** show real AIMS product cut-outs on white, big and whole, named by their model codes in mono.
- **Do** keep AIMS Green (#26703a) for actions and selection only, and lime for light and signal only.
- **Do** lift cards: hairline + plinth shadow at rest, 2px rise with the lifted plinth shadow on hover; set text that
  needs no box as open rows under a hairline.
- **Do** switch to night-green surfaces (#0a1a10 family) for a section that tells a story, and back to the white
  showroom floor and its faint bands for the catalogue.
- **Do** keep every text pair at 4.5:1 or better, including lime and muted text on night surfaces.
- **Do** keep 44px touch targets and the shared container's two content edges on every section.

### Don't:

- **Don't** put a manufacturer's logo in the header or hero; ZKTeco logos only identify products.
- **Don't** use a secondary blue, violet or burgundy, or gradients as decoration on light surfaces.
- **Don't** use stock "consulting", hologram or "ACCESS GRANTED" imagery, glassmorphism, blobs or carousels.
- **Don't** repeat the same filled green button across a row of cards; a card's action is a text link.
- **Don't** set lime as text on light surfaces (2.29:1) or use ink-300 for information.
- **Don't** caption images; licence credits go in one footer line.
