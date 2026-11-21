/**
 * Imports AIMS's catalogue from aimsuae.me into typed JSON under content/.
 *
 *   pnpm import:content            # uses the HTML cache in .cache/aims when present
 *   pnpm import:content --refresh  # refetch every page
 *   pnpm import:content --no-images
 *
 * Output:
 *   content/products.json    162 products (validated with Zod)
 *   content/software.json    software pages
 *   content/import-report.json  counts, duplicates and data issues to raise with AIMS
 *   public/images/products/*.webp, public/images/software/*.webp
 *
 * The site never fetches from aimsuae.me at runtime; this script is the only
 * place that reads it.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { z } from "zod";
import { ProductSchema, SoftwareSchema, type Block, type Product, type Software } from "../src/content/schema";
import {
  CATEGORY_TO_FAMILY,
  OLD_CATEGORIES,
  SWCATEGORY_TO_TYPE,
  type FamilySlug,
  type SoftwareType,
} from "../src/content/taxonomy";
import {
  bulletsToBlocks,
  cleanText,
  deriveBrand,
  deriveFacets,
  deriveModel,
  displayName,
  excerpt,
  isSlugVariant,
  modelKey,
  normaliseSpecs,
  productSignature,
  stripBoilerplate,
} from "./lib/normalise";

const ORIGIN = "https://aimsuae.me";
const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache/aims");
const OUT = path.join(ROOT, "content");
const IMG_OUT = path.join(ROOT, "public/images");
const args = new Set(process.argv.slice(2));
const REFRESH = args.has("--refresh");
const IMAGES = !args.has("--no-images");
const CONCURRENCY = 4;
const UA = "aims-website-content-import/1.0";

/* ---------- fetching with a disk cache ---------- */

const exists = (p: string) =>
  access(p).then(
    () => true,
    () => false,
  );
const cacheFile = (url: string) => path.join(CACHE, createHash("sha1").update(url).digest("hex") + ".html");

async function fetchWithRetry(url: string, tries = 3): Promise<Response> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
      if (res.status >= 500 && i < tries) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
}

async function getHtml(url: string): Promise<string | null> {
  const file = cacheFile(url);
  if (!REFRESH && (await exists(file))) return readFile(file, "utf8");
  const res = await fetchWithRetry(url);
  if (!res.ok) {
    issues.push({ kind: "http", url, detail: `HTTP ${res.status}` });
    return null;
  }
  const html = await res.text();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, html);
  return html;
}

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

/* ---------- report ---------- */

type Issue = { kind: string; url?: string; slug?: string; detail: string };
const issues: Issue[] = [];

/* ---------- categories → product slugs ---------- */

function productLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const slugs = new Set<string>();
  $('a[href*="/product/"]').each((_, a) => {
    const m = /\/product\/([a-z0-9-]+)\/?$/i.exec($(a).attr("href") ?? "");
    if (m && m[1] !== "brochure") slugs.add(m[1].toLowerCase());
  });
  return [...slugs];
}

async function crawlCategory(slug: string): Promise<string[]> {
  const found = new Set<string>();
  for (let page = 1; page <= 20; page++) {
    const url = `${ORIGIN}/category/${slug}${page > 1 ? `?page=${page}` : ""}`;
    const html = await getHtml(url);
    if (!html) break;
    const before = found.size;
    productLinks(html).forEach((s) => found.add(s));
    const hasNext = cheerio.load(html)(`a[href$="?page=${page + 1}"]`).length > 0;
    if (found.size === before || !hasNext) break;
  }
  return [...found];
}

/* ---------- product page ---------- */

const BLOCK_TAGS = new Set(["p", "div", "section", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table", "figure"]);

function overviewBlocks($: cheerio.CheerioAPI, root: string): Block[] {
  const blocks: Block[] = [];
  const el = $(root).first();
  // AIMS overviews mix <p>, <h2>, <ul>, tables, and bare "•" text runs
  // separated by <br> directly inside the container.
  el.find("br").replaceWith(" ");
  let inline = "";
  const flush = () => {
    blocks.push(...bulletsToBlocks(stripBoilerplate(inline)));
    inline = "";
  };
  el.contents().each((_, node) => {
    if (node.type === "text") {
      inline += $(node).text();
      return;
    }
    if (node.type !== "tag") return;
    const tag = node.tagName.toLowerCase();
    if (!BLOCK_TAGS.has(tag)) {
      inline += $(node).text();
      return;
    }
    flush();
    const $n = $(node);
    if (/^h[1-6]$/.test(tag)) {
      const text = cleanText($n.text());
      if (text) blocks.push({ type: "h", text });
    } else if (tag === "ul" || tag === "ol") {
      const items = $n
        .find("li")
        .map((_, li) => cleanText($(li).text()))
        .get()
        .filter(Boolean);
      if (items.length) blocks.push({ type: "ul", items });
    } else if (tag === "table") {
      // Tables are read as specifications (see tableSpecs), not copy.
    } else {
      blocks.push(...bulletsToBlocks(stripBoilerplate($n.text())));
    }
  });
  flush();
  return blocks.filter((b) => (b.type === "ul" ? b.items.length : b.text.length));
}

/** Two-column tables inside the overview, used on pages with an empty spec tab. */
function tableSpecs($: cheerio.CheerioAPI, root: string) {
  return $(`${root} table`)
    .map((_, table) => {
      const rows = $(table)
        .find("tr")
        .map((_, tr) => {
          const cells = $(tr)
            .find("th,td")
            .map((_, c) => cleanText($(c).text()))
            .get();
          return cells.length === 2 && cells[0] && cells[1] ? [[cells[0], cells[1]] as [string, string]] : [];
        })
        .get() as [string, string][];
      const caption =
        cleanText($(table).find("caption").text()) || cleanText($(table).prevAll("h2,h3,h4").first().text());
      return rows.length >= 2 ? { title: caption.length < 60 ? caption : "Specifications", rows } : [];
    })
    .get() as { title: string; rows: [string, string][] }[];
}

type RawProduct = Omit<Product, "images" | "family"> & {
  family: FamilySlug | null;
  imageUrls: string[];
};

function parseProduct(slug: string, html: string, categories: string[]): RawProduct | null {
  const $ = cheerio.load(html);
  const rawName = cleanText($("h1.product-title").first().text());
  if (!rawName) {
    issues.push({ kind: "parse", slug, detail: "No product title (h1.product-title)" });
    return null;
  }

  const specGroups = $(".spec-bento-card")
    .map((_, card) => ({
      title: cleanText($(card).find("h3").first().text()),
      rows: $(card)
        .find(".spec-row")
        .map(
          (_, row) =>
            [[cleanText($(row).find("dt").text()), cleanText($(row).find("dd").text())]] as [string, string][],
        )
        .get() as [string, string][],
    }))
    .get();
  let specs = normaliseSpecs(specGroups);
  if (!specs.length) {
    specs = normaliseSpecs(tableSpecs($, "#overview .overview-content"));
    if (specs.length)
      issues.push({ kind: "content", slug, detail: "Spec tab empty; specs read from a table in the overview" });
    else issues.push({ kind: "content", slug, detail: "No structured specifications on the AIMS page" });
  }

  const overview = overviewBlocks($, "#overview .overview-content");
  const header = cleanText($(".product-header-description").first().text()).replace(/\.\.\.$/, "");
  const firstPara = overview.find((b) => b.type === "p")?.text;
  const firstList = overview.find((b) => b.type === "ul");
  const summarySource = firstPara ?? (firstList?.type === "ul" ? firstList.items.slice(0, 2).join(" ") : header);

  const imageUrls = [
    ...new Set(
      $(".product-header-image img, .product-gallery img, .product-header-media img")
        .map((_, img) => $(img).attr("src") ?? $(img).attr("data-src") ?? "")
        .get()
        .filter((src) => /\/uploads\/product_images\//.test(src))
        .map((src) => new URL(src, ORIGIN).href),
    ),
  ];
  if (!imageUrls.length) issues.push({ kind: "content", slug, detail: "No product image" });

  const brochure = $('a[href*="/product/brochure/"]').first().attr("href");
  const brand = deriveBrand(rawName, categories);
  const family = categories.map((c) => CATEGORY_TO_FAMILY[c]).find((f): f is FamilySlug => !!f) ?? null;

  return {
    slug,
    name: displayName(rawName, brand),
    brand,
    model: deriveModel(rawName),
    family,
    sourceCategories: categories,
    label: cleanText($(".product-label").first().text()) || undefined,
    summary: excerpt(summarySource || rawName, 180),
    overview,
    specs,
    ...deriveFacets(rawName, specs),
    imageUrls,
    datasheetUrl: brochure ? new URL(brochure, ORIGIN).href : null,
    sourceUrl: `${ORIGIN}/product/${slug}`,
  };
}

/* ---------- software ---------- */

async function crawlSoftware(): Promise<Software[]> {
  const typesBySlug = new Map<string, Set<SoftwareType>>();
  for (const [sw, type] of Object.entries(SWCATEGORY_TO_TYPE)) {
    const html = await getHtml(`${ORIGIN}/swcategory/${sw}`);
    if (!html) continue;
    const $ = cheerio.load(html);
    $('a[href*="/software/"]').each((_, a) => {
      const m = /\/software\/([a-z0-9-]+)\/?$/i.exec($(a).attr("href") ?? "");
      if (!m) return;
      const set = typesBySlug.get(m[1]) ?? new Set();
      if (type) set.add(type);
      typesBySlug.set(m[1], set);
    });
  }

  const slugs = [...typesBySlug.keys()].sort();
  const out = await pool(slugs, async (slug) => {
    const url = `${ORIGIN}/software/${slug}`;
    const html = await getHtml(url);
    if (!html) return null;
    const $ = cheerio.load(html);
    const name = cleanText($("h1.product-title").first().text());
    if (!name) {
      issues.push({ kind: "parse", slug, detail: "No software title" });
      return null;
    }
    const overview = overviewBlocks($, "#overview .overview-content");
    const types = [...(typesBySlug.get(slug) ?? [])];
    if (/cv ?security|cv ?access/i.test(name)) types.push("security-platform");
    const dl = $("#download a").first().attr("href") ?? null;
    const isRequest = !dl || /wa\.me|whatsapp/i.test(dl);
    const imgSrc = $(".product-header-image img").first().attr("src");
    const image = imgSrc && IMAGES ? await saveImage(new URL(imgSrc, ORIGIN).href, `software/${slug}`, name) : null;
    return {
      slug,
      name,
      types: [...new Set(types)],
      summary: excerpt(overview.find((b) => b.type === "p")?.text ?? name, 180),
      overview,
      image,
      delivery: isRequest ? "request" : "direct",
      downloadUrl: isRequest ? null : new URL(dl!, ORIGIN).href,
      sourceUrl: url,
    } satisfies Software;
  });
  return out.filter((s): s is Software => s !== null);
}

/* ---------- images ---------- */

async function saveImage(url: string, name: string, alt: string) {
  const rel = `/images/${name}.webp`;
  const file = path.join(IMG_OUT, `${name}.webp`);
  try {
    if (REFRESH || !(await exists(file))) {
      const res = await fetchWithRetry(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(path.dirname(file), { recursive: true });
      await sharp(buf)
        .rotate()
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .webp({ quality: 82 })
        .toFile(file);
    }
    const meta = await sharp(file).metadata();
    return { src: rel, width: meta.width!, height: meta.height!, alt, source: url };
  } catch (err) {
    issues.push({ kind: "image", url, detail: String(err) });
    return null;
  }
}

/* ---------- main ---------- */

async function main() {
  console.log(`Import from ${ORIGIN}${REFRESH ? " (refresh)" : ""}`);

  // 1. Category membership
  const membership = new Map<string, string[]>();
  const categoryCounts: Record<string, number> = {};
  for (const cat of OLD_CATEGORIES) {
    const slugs = await crawlCategory(cat);
    categoryCounts[cat] = slugs.length;
    for (const s of slugs) membership.set(s, [...(membership.get(s) ?? []), cat]);
  }
  // Keep categories in taxonomy priority order so the first decides the family.
  for (const [s, cats] of membership)
    membership.set(
      s,
      OLD_CATEGORIES.filter((c) => cats.includes(c)),
    );
  console.log(`  categories: ${OLD_CATEGORIES.length}, unique products: ${membership.size}`);

  // 2. Product pages
  const slugs = [...membership.keys()].sort();
  const raws = await pool(slugs, async (slug) => {
    const html = await getHtml(`${ORIGIN}/product/${slug}`);
    return html ? parseProduct(slug, html, membership.get(slug)!) : null;
  });

  // 3. Duplicates: the same model published under two slugs (f18 / f18-1).
  //    Canonical = more spec rows, then the shorter slug. The duplicate is
  //    kept in the data (for the 301 map) but hidden from listings.
  const byModel = new Map<string, RawProduct[]>();
  for (const p of raws.filter((r): r is RawProduct => r !== null)) {
    const key = modelKey(p.model);
    byModel.set(key, [...(byModel.get(key) ?? []), p]);
  }
  for (const group of byModel.values()) {
    if (group.length < 2) continue;
    const rows = (p: RawProduct) => p.specs.reduce((n, g) => n + g.rows.length, 0);
    group.sort((a, b) => rows(b) - rows(a) || a.slug.length - b.slug.length || a.slug.localeCompare(b.slug));
    const [canonical, ...dupes] = group;
    for (const d of dupes) {
      const sameSpecs = productSignature(d.model, d.specs) === productSignature(canonical.model, canonical.specs);
      if (!isSlugVariant(d.slug, canonical.slug)) {
        // Same title on two unrelated slugs (zkbio810 is titled "ZKAIO1000"):
        // likely a data-entry error on aimsuae.me, so keep both and flag it.
        issues.push({
          kind: "data",
          slug: d.slug,
          detail: `Titled "${d.name}" like ${canonical.slug}; check the title with AIMS`,
        });
        continue;
      }
      d.duplicateOf = canonical.slug;
      canonical.sourceCategories = OLD_CATEGORIES.filter(
        (c) => canonical.sourceCategories.includes(c) || d.sourceCategories.includes(c),
      );
      issues.push({
        kind: "duplicate",
        slug: d.slug,
        detail: `Duplicate of ${canonical.slug}${sameSpecs ? " (identical specs)" : " (specs differ; canonical has more rows)"}`,
      });
    }
  }

  // 4. Images + validation
  const products: Product[] = [];
  await pool(
    raws.filter((r): r is RawProduct => r !== null),
    async (raw) => {
      const { imageUrls, family, ...rest } = raw;
      if (!family) {
        issues.push({
          kind: "taxonomy",
          slug: raw.slug,
          detail: `No family for categories ${raw.sourceCategories.join(", ")}`,
        });
        return;
      }
      const images = [];
      if (IMAGES) {
        for (const [i, url] of imageUrls.entries()) {
          const img = await saveImage(url, `products/${raw.slug}${i ? `-${i + 1}` : ""}`, raw.name);
          if (img) images.push(img);
        }
      }
      const parsed = ProductSchema.safeParse({ ...rest, family, images });
      if (parsed.success) products.push(parsed.data);
      else issues.push({ kind: "schema", slug: raw.slug, detail: z.prettifyError(parsed.error) });
    },
  );
  products.sort((a, b) => a.slug.localeCompare(b.slug));

  // 5. Software
  const software = (await crawlSoftware()).filter((s) => {
    const r = SoftwareSchema.safeParse(s);
    if (!r.success) issues.push({ kind: "schema", slug: s.slug, detail: z.prettifyError(r.error) });
    return r.success;
  });

  // 6. Write
  await mkdir(OUT, { recursive: true });
  const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";
  await writeFile(path.join(OUT, "products.json"), json(products));
  await writeFile(path.join(OUT, "software.json"), json(software));

  const familyCounts = Object.fromEntries(
    [...new Set(products.map((p) => p.family))]
      .sort()
      .map((f) => [f, products.filter((p) => p.family === f && !p.duplicateOf).length]),
  );
  const report = {
    source: ORIGIN,
    importedAt: new Date().toISOString(),
    counts: {
      productsFound: membership.size,
      productsImported: products.length,
      duplicates: products.filter((p) => p.duplicateOf).length,
      withoutSpecs: products.filter((p) => !p.specs.length).length,
      withoutImage: products.filter((p) => !p.images.length).length,
      withoutDatasheet: products.filter((p) => !p.datasheetUrl).length,
      software: software.length,
      softwareByRequestOnly: software.filter((s) => s.delivery === "request").length,
    },
    familyCounts,
    categoryCounts,
    issues: issues.sort((a, b) => a.kind.localeCompare(b.kind) || (a.slug ?? "").localeCompare(b.slug ?? "")),
  };
  await writeFile(path.join(OUT, "import-report.json"), json(report));

  console.log(`  products: ${products.length}, software: ${software.length}, issues: ${issues.length}`);
  console.log(`  families: ${JSON.stringify(familyCounts)}`);
  const hardFailures = issues.filter((i) => i.kind === "schema" || i.kind === "parse");
  if (hardFailures.length) {
    console.error(`  ${hardFailures.length} schema/parse failures — see content/import-report.json`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
