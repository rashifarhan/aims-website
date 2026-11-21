# aims-website

Redesign of [aimsuae.me](https://aimsuae.me) for AIMS Security Systems Trading LLC, a ZKTeco distributor in Dubai.
It is a hiring assignment: build AIMS a better site than its competitor's. The strategy, scope and design live in
[`docs/`](docs/README.md): Master Plan v2.0 and Design Document v0.1, plus the approved animation prototypes. Rules for
working in this repo (for people and for Claude Code) are in [`CLAUDE.md`](CLAUDE.md).

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Script                | What it does                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `pnpm dev`            | Dev server (Turbopack)                                           |
| `pnpm build`          | Production build                                                 |
| `pnpm check`          | Lint + typecheck + unit tests                                    |
| `pnpm test`           | Vitest unit tests (importer, redirects, content, dictionaries)   |
| `pnpm e2e`            | Playwright smoke + axe on desktop and mobile (run `build` first) |
| `pnpm format`         | Prettier (with Tailwind class sorting)                           |
| `pnpm import:content` | Re-import the catalogue from aimsuae.me (see below)              |

Requires Node 22 and pnpm 10.

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4. Design tokens live in `src/app/globals.css` (`@theme`)
- Zod for content schemas
- Fonts self-hosted with `next/font/local`: Inter, IBM Plex Mono, IBM Plex Sans Arabic (OFL)
- Vitest, Playwright, @axe-core/playwright, GitHub Actions

## Structure

```
content/                 imported catalogue (generated, committed)
  products.json          162 products
  software.json          8 software pages
  import-report.json     counts + data issues to raise with AIMS
public/images/           product and software images (webp, ≤1200px)
scripts/import-aims.ts   the importer; scripts/lib/normalise.ts has the pure helpers
src/
  app/[lang]/            every page; the root layout sits under [lang]
  app/global-not-found.tsx
  content/               schema.ts, taxonomy.ts, catalogue.ts (typed accessors)
  i18n/                  locales, dictionaries, en.json / ar.json
  lib/routes.ts          route registry: the 35 designed routes + status
  lib/redirects.ts       301 map from old aimsuae.me URLs
  proxy.ts               locale routing
tests/e2e/               Playwright
```

## Decisions

**URLs.** English has no prefix, so every existing aimsuae.me product, software and location URL keeps its address
and its ranking. Arabic is served under `/ar`. `src/proxy.ts` rewrites `/x` to `/en/x` internally and sends `/en/x`
to `/x` with a 308.

**i18n.** I used Next's built-in pattern (`app/[lang]` + `next/root-params` + JSON dictionaries) instead of next-intl.
It needs no extra dependency and works with Cache Components. `ar.json` must have exactly the keys of `en.json`, and a
unit test enforces it.

**Redirects.** Every entry in `src/lib/redirects.ts` returns **301**, as AT-13 requires (Next's default would be 308).
Unit tests check that the map has no duplicates and no chains, and that every destination resolves to a route the site
serves.

**Indexing is off by default.** Every deployment sends `X-Robots-Tag: noindex`, a robots meta tag and
`Disallow: /`. Set `SITE_INDEXABLE=true` on the production deployment only, at launch. See `.env.example`.

**404.** Because the root layout sits under a dynamic `[lang]` segment, unmatched URLs use `global-not-found.tsx`
(the Next docs recommend this for that case).

**Route registry.** `src/lib/routes.ts` lists the 35 designed routes, each with a `status`. A route moves to `"built"`
in the commit that adds its page. From then on the e2e suite requires it to return 200, have one `h1`, allow zoom,
and pass axe with zero violations.

## Content import

```bash
pnpm import:content            # uses the HTML cache in .cache/aims (gitignored)
pnpm import:content --refresh  # refetch everything
```

The importer crawls the 16 category pages, collects 162 unique products and parses each product page: title, specs,
overview, images and datasheet link. It also reads the 8 software pages. It normalises spec labels (for example
"Dimension(WxDxH)" becomes "Dimensions (W × D × H)"), derives facets (verification method, connectivity, outdoor),
maps each product to one of 6 families, and converts images to webp. Every record is validated with Zod.

The site never contacts aimsuae.me at runtime. Inside a sandbox whose proxy Node's `fetch` doesn't pick up, run the
import with `NODE_USE_ENV_PROXY=1`.

### What the import found (to raise with AIMS)

From `content/import-report.json`:

- **3 duplicate products**: `f18-1`, `biopro-mh20-1` and `biopro-sa20` repeat `f18`, `biopro-mh20` and
  `bio-pro-sa20`. The duplicates are hidden and 301 to the record with more spec rows.
- **`zkbio810` is titled "ZKAIO1000"**, the same title as `zkaio1000`. Both are kept until AIMS confirms which is right.
- **42 products have no structured specs.** On 22 more, the spec tab is empty and the importer reads the specs from a
  table in the overview.
- **6 products have no datasheet.**
- **All 8 software "Download" buttons open WhatsApp.** There is no direct download, so the Download Centre treats
  delivery as "request" until AIMS says files can be linked.

## Not yet confirmed by AIMS

Logo, ZKTeco authorization wording, founding year (2011 or 2014), opening hours, which phone number serves which need,
permission to link datasheets and software files, and an Arabic reviewer. `ar.json` is a first draft and needs that
review.
