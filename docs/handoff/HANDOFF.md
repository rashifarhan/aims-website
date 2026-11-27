# Handoff: redesign the main pages in directions 2 and 3

Written 27 Nov 2026 for the next Claude Code session (another account with access to this repository). Read this
file, then `CLAUDE.md` and `AGENTS.md`, before changing anything.

## 1. Where things stand

- **Project:** the AIMS website redesign (aimsuae.me), Next.js 16 + Tailwind 4 + pnpm. `CLAUDE.md` holds the rules
  (truth, tokens, accessibility, i18n, tests). They still apply on these branches unless the client says otherwise.
- **The team reviewed three hero directions and chose two of them, 2 and 3.** Both are built as preview pages on
  branch `claude/hero-options`:
  - Direction 2, **Step inside the terminal**: `/preview/step-inside`
  - Direction 3, **Product family slider**: `/preview/families`
- **The task now:** apply each direction across the site's main pages, one branch per direction, so the team gets one
  live Vercel preview per direction to compare as a demo:
  - `claude/direction-2-step-inside`: direction 2 across the main pages
  - `claude/direction-3-families`: direction 3 across the main pages
    Both branches already exist, created from `claude/hero-options`, so they start with the preview components, the
    cut-out photos and this file. Previews follow the pattern
    `https://aims-website-git-<branch-with-slashes-as-dashes>-aims-ce3b.vercel.app` (Vercel login required unless
    the owner shares the deployment or turns preview protection off).
- **Do not merge into `main`** unless the owner explicitly says "merge". `main` is the public demo
  (aims-zkteco-demo.vercel.app). Don't open a PR unless asked. Never force-push.

### Other branches (context only, don't build on them)

| Branch                | What it is                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`                | The live site: light premium design, SpeedFace hero.                                                                                                                                   |
| `claude/software-seo` | ZKAccess replaced by ZKBio CVSecurity and CVAccess, client SEO keywords in copy. **Not yet in `main`.** `claude/hero-options` was branched from it, so the direction branches have it. |
| `claude/3d-hero`      | Direction 1, the green particle-face scroll hero (Three.js). Liked, not chosen for this round.                                                                                         |
| `claude/video-home`   | Rejected video experiments (product reel, stock film). Ignore.                                                                                                                         |

## 2. The two directions: the patterns to carry across pages

Study the source before designing: `src/components/preview/` (StepInside.tsx, step-inside.css, FamilySlider.tsx,
FamilyStage.tsx, family-slider.css, familyShowcase.ts). Watch both previews in a browser.

### Direction 2: Step inside the terminal

- **Stage:** a dark night-green stage (radial `#24603f` → `#143826` → `#0b1d14`) under a white header.
- **Signature:** a real AIMS product photo stands in front of a giant Archivo 900 word (font-stretch 125%, tight
  tracking). On the home page that is the SpeedFace before "AIMS", with an access card on a lanyard and an italic
  lime "Authorized ZKTeco distributor · UAE" pill.
- **Motion:** scrolling pins the stage (CSS `position: sticky`, native scroll, no scroll-jacking). The device flies
  forward until its screen fills the height (zoom in log space, eased ends). The content then opens outward from
  inside that screen with a `clip-path: inset()`. A rAF loop glides the progress towards the scroll position
  (factor 0.2), so wheel steps read as one move. No filters on the moving device; its shadow is a separate layer.
- **Inside the screen:** a cream "ticket" card (`#f5f1e8`, IBM Plex Mono uppercase rows, dashed dividers, punched
  notches via mask), a large product photo, one short line, a white pill button (dark circle with lime arrow), round
  prev/next arrows and word chips (TIME, ACCESS, ENTRY…) with the active chip in lime.
- **Carrying it across pages:** each main page opens on a dark stage with its own device and giant word. Spec and
  fact panels use the ticket card. At most one pinned "step inside" sequence per page (CLAUDE.md §3). The rest of
  each page stays the site's light sections.

### Direction 3: Product family slider

- **Signature:** each product family owns a ground colour and one giant white word sized to fit, with AIMS's photo of
  a real model on top and real accessories floating around it at different depths. Two corner pieces are large and
  blurred. A soft ellipse shadow sits under the product.
- **Families, in order** (client: access control first, time attendance second), from `familyShowcase.ts`:

  | Family              | Word   | Ground    | Model shown    |
  | ------------------- | ------ | --------- | -------------- |
  | Access control      | ACCESS | `#0f1f17` | SpeedFace-V5L  |
  | Time attendance     | TIME   | `#26703a` | iFace 990 Plus |
  | Entrance & parking  | ENTRY  | `#2c5a4d` | MARS-B1200     |
  | Smart & hotel locks | LOCKS  | `#4b5a34` | TL700          |
  | Door hardware       | PARTS  | `#32453c` | AL 280D        |
  | POS                 | POS    | `#1d3b31` | ZKAIO1000      |

- **Motion:** changing family wipes the new ground in from the side it comes from (clip-path), and the word, product
  and pieces arrive with parallax by depth. The pieces float slowly and drift with the pointer (fine pointers only).
  Tabs, arrows, the arrow keys and swipe change it. **Nothing runs on a timer** (no auto-rotation, CLAUDE.md §2). The
  owner asked whether it could change on scroll or auto-play with a pause button; that is still undecided, so ask.
- **UI:** a frosted pill tab bar (active tab white), a mono counter "01 / 06", top-left caption (uppercase family
  name, one line, a "Shown: model" chip linking to the product), "SEE THE RANGE" with the real model count at the
  bottom, and circle arrows naming the next and previous words.
- **Carrying it across pages:** a family page (`/products/[family]`) opens on its own ground and word. A product page
  sits its product on its family's ground with that family's accessories. Solution pages use their word (ACCESS,
  TIME, ENTRY). The six grounds become tokens.

### Shared rules for both

- **Product photos:** AIMS's own, cut out of their white studio backgrounds into `public/images/cutouts/`, using
  `docs/handoff/cutout.py` (flood-fills the white from the edges, soft alpha). After cutting, remove stray fragments
  and trim studio reflections (some photos have a mirror floor; the iFace and the exit button needed a cut along the
  base). Check every cut-out on a dark ground before using it. The owner noticed white bits on poor cut-outs.
- **Facts:** every model count comes from the catalogue (`productsInFamily`). Card facts are only what
  `content/products.json` states. Never invent specs (CLAUDE.md §1).
- **Debt to fix when promoting preview code to real pages:** the preview components use raw hex colours and
  hard-coded English strings. Real pages must use tokens in `src/app/globals.css` (add the six family grounds and
  the ticket cream with a comment) and keys in `src/i18n/messages/en.json` and `ar.json`, with RTL handled.

## 3. Scope: the main pages

Redesign at least these, in this order, each in both directions:

1. Home `/` (replace the current hero with the direction's hero; keep the home sections below and restyle them to match)
2. Products hub `/products` and the six family pages `/products/[family]`
3. Product detail `/product/[slug]`
4. Solutions hub `/solutions` and the solution pages
5. Software `/software` and the software pages
6. Services, About, Locations, Contact, Quote

URLs never change (CLAUDE.md §6). Keep the header, footer, quote flow and search working. When a direction's hero
replaces the home hero, delete `/preview/*` from that branch or leave it. Say which in the commit.

## 4. How the owner works (please keep to this)

- **Show still mockups and get approval before building a design change.** The owner has rejected work built
  without approval several times.
- **Plain, short updates.** The owner reviews on a phone through Vercel previews and screen recordings.
- **Record motion for review:** live screen recordings in this container look slow because WebGL and heavy pages draw
  in software. Capture frame by frame with Playwright's `page.clock` (install, then `runFor(33)` per frame and a
  screenshot), and join the frames at 30 fps with ffmpeg. That is how the smooth face-scan video was made.
- **Facts the owner has not confirmed:** AIMS has an _office_ in Abu Dhabi, not a showroom. There are no metal
  detector products in the catalogue yet. The Arabic copy is a draft until AIMS's reviewer approves it.
- **Don't copy NUZON** (the competitor) in brand, copy or assets.
- **Commits:** end each message with the attribution lines your session's system prompt gives you; mention the
  direction and the page.

## 5. Tools

- **MotionSites skill** (`motionsites-web-builder`), where the two directions came from (Laptop Portfolio and Smoothie
  Slider). It is not in git (its licence forbids redistributing the examples). To install it in the new session:
  `git clone --depth 1 https://github.com/Motionsites-AI/claude-skill /tmp/ms` then copy
  `/tmp/ms/plugins/motionsites-web-builder/skills/motionsites-web-builder` to `.claude/skills/`, and add that path
  to `.git/info/exclude`.
- The project's own design skills are in `.agents/skills/` and `.claude/skills/` (design-taste-frontend, impeccable,
  animate, choreograph and others). `CLAUDE.md` says how they rank.
- Checks: `pnpm check` (lint, typecheck, unit tests), `pnpm build`, `pnpm e2e` (Playwright on port 3100).

## 6. Shared review page

The owner presented the three directions from a claude.ai artifact on the old account:
https://claude.ai/artifact/VNtRnbqA9MjQgZ2sddjvFp (videos load as in-memory blobs so they play on phones). The new
account can't edit it; make a new one if needed.
