/**
 * Import AIMS's editorial pages from aimsuae.me (pnpm import:pages): the privacy policy, the terms
 * and conditions, the blog index and every article it lists. The text is AIMS's own, kept verbatim
 * as structured blocks (CLAUDE.md §1, §8: no HTML is stored or injected); each article's image is
 * downloaded, because the site never calls aimsuae.me at runtime (CLAUDE.md §5).
 *
 *   content/pages.json                 { legal: {...}, articles: [...] }
 *   public/images/blog/<slug>.webp     one image per article
 *
 * Responses are cached in .cache/aims-pages; pass --refresh to fetch again.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import sharp from "sharp";

const ORIGIN = "https://aimsuae.me";
const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache/aims-pages");
const IMG_OUT = path.join(ROOT, "public/images/blog");
const UA = "aims-website-content-import/1.0";
const REFRESH = process.argv.includes("--refresh");

type Block = { type: "p" | "h"; text: string } | { type: "ul"; items: string[] };
type Article = {
  slug: string;
  title: string;
  date: string | null;
  excerpt: string;
  image: { src: string; width: number; height: number; alt: string } | null;
  blocks: Block[];
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

async function getHtml(url: string): Promise<string> {
  const file = path.join(CACHE, `${createHash("sha1").update(url).digest("hex")}.html`);
  if (!REFRESH) {
    try {
      return await readFile(file, "utf8");
    } catch {
      // Not cached yet: fetch below.
    }
  }
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const html = await res.text();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, html);
  return html;
}

const BLOCK = new Set([
  "h2",
  "h3",
  "h4",
  "h5",
  "p",
  "ul",
  "ol",
  "div",
  "section",
  "article",
  "li",
  "table",
  "blockquote",
]);
const HAS_BLOCK = "h2, h3, h4, h5, p, ul, ol, div, table";

/**
 * The page's copy as blocks, in document order: headings below the h1, paragraphs and lists. The
 * live pages nest whole sections inside list items (malformed HTML), so a list whose items hold
 * block content is walked into rather than flattened into one bullet.
 */
function blocks($: cheerio.CheerioAPI, root: cheerio.Cheerio<never>): Block[] {
  const out: Block[] = [];
  let inline = "";
  const flush = () => {
    const text = clean(inline);
    if (text) out.push({ type: "p", text });
    inline = "";
  };
  const walk = (parent: cheerio.Cheerio<never>) => {
    parent.contents().each((_, node) => {
      if (node.type === "text") {
        inline += $(node).text();
        return;
      }
      if (node.type !== "tag") return;
      const tag = node.tagName.toLowerCase();
      const $n = $(node) as cheerio.Cheerio<never>;
      if (tag === "br") {
        flush();
        return;
      }
      if (!BLOCK.has(tag)) {
        inline += $n.text();
        return;
      }
      flush();
      if (/^h[2-5]$/.test(tag)) {
        const text = clean($n.text());
        // The live pages mark some whole paragraphs as headings; a sentence that long is copy.
        if (text) out.push({ type: text.length > 100 ? "p" : "h", text });
      } else if (tag === "ul" || tag === "ol") {
        const lis = $n.children("li");
        if (lis.filter((__, li) => $(li).find(HAS_BLOCK).length > 0).length) walk($n);
        else {
          const items = lis
            .map((__, li) => clean($(li).text()))
            .get()
            .filter(Boolean);
          if (items.length) out.push({ type: "ul", items });
        }
      } else if (tag === "table") {
        // Layout tables carry no copy on these pages.
      } else walk($n);
    });
    flush();
  };
  walk(root);
  return out;
}

/** "Nov/18/2026 06:19:59" → "2026-11-18"; null when the site gives no date. */
function isoDate(raw: string | undefined): string | null {
  const m = raw?.match(/([A-Za-z]{3})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(m[1]) / 3 + 1;
  return month > 0 ? `${m[3]}-${String(month).padStart(2, "0")}-${m[2].padStart(2, "0")}` : null;
}

async function saveImage(url: string, slug: string, alt: string): Promise<Article["image"]> {
  const file = path.join(IMG_OUT, `${slug}.webp`);
  if (!REFRESH) {
    try {
      // Already downloaded: reuse it, so a re-run reads only the cache.
      const meta = await sharp(file).metadata();
      if (meta.width && meta.height)
        return { src: `/images/blog/${slug}.webp`, width: meta.width, height: meta.height, alt };
    } catch {
      // Not downloaded yet: fetch below.
    }
  }
  try {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (!res.ok) return null;
    await mkdir(IMG_OUT, { recursive: true });
    // One article image is a very large upload; the pixel guard would refuse it.
    const info = await sharp(Buffer.from(await res.arrayBuffer()), { limitInputPixels: false })
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(file);
    return { src: `/images/blog/${slug}.webp`, width: info.width, height: info.height, alt };
  } catch (error) {
    // A missing image leaves the article without one rather than failing the import.
    console.warn(`  image skipped for ${slug}: ${(error as Error).message}`);
    return null;
  }
}

async function legalPage(slug: string) {
  const $ = cheerio.load(await getHtml(`${ORIGIN}/${slug}`));
  const h1 = $("h1").first();
  return { title: clean(h1.text()), blocks: blocks($, h1.parent() as cheerio.Cheerio<never>) };
}

async function main() {
  console.log(`Import editorial pages from ${ORIGIN}${REFRESH ? " (refresh)" : ""}`);
  const legal = {
    "privacy-policy": await legalPage("privacy-policy"),
    "terms-and-conditions": await legalPage("terms-and-conditions"),
  };

  const $index = cheerio.load(await getHtml(`${ORIGIN}/blog`));
  const cards = $index(".blog-card")
    .map((_, card) => {
      const $c = $index(card);
      const href = $c.find("a.blog-post-link").attr("href") ?? "";
      return {
        slug: href.replace(`${ORIGIN}/blog/`, "").replace(/\/$/, ""),
        title: clean($c.find(".blog-post-title").text()),
        date: isoDate($c.find("time").attr("datetime")),
        excerpt: clean($c.find(".blog-excerpt").text()),
        imageUrl: $c.find("img").attr("src") ?? null,
      };
    })
    .get()
    .filter((c) => /^[a-z0-9-]+$/.test(c.slug));

  const articles: Article[] = [];
  for (const card of cards) {
    const $ = cheerio.load(await getHtml(`${ORIGIN}/blog/${card.slug}`));
    const body = $(".single-blog-des-container .postContent").first() as cheerio.Cheerio<never>;
    articles.push({
      slug: card.slug,
      title: clean($(".single-blog-des-container h1").first().text()) || card.title,
      date: card.date,
      excerpt: card.excerpt,
      image: card.imageUrl ? await saveImage(card.imageUrl, card.slug, card.title) : null,
      blocks: blocks($, body),
    });
    console.log(`  article: ${card.slug} (${articles.at(-1)?.blocks.length} blocks)`);
  }

  await writeFile(path.join(ROOT, "content/pages.json"), JSON.stringify({ legal, articles }, null, 2) + "\n");
  console.log(`pages: 2 legal, ${articles.length} articles`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
