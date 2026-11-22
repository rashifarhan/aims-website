/**
 * Imports AIMS's own published text pages (company, legal, warranty, FAQ, one blog article) into
 * content/pages.json as structured blocks, so the T10 pages never carry copy we wrote ourselves
 * (CLAUDE.md §1) and never raw HTML (§8). Reuses the product importer's HTML cache.
 *
 *   pnpm import:pages            # uses .cache/aims when present
 *   pnpm import:pages --refresh  # refetch from aimsuae.me
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { z } from "zod";
import { BlockSchema, type Block } from "../src/content/schema";
import { cleanText } from "./lib/normalise";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache/aims");
const OUT = path.join(ROOT, "content/pages.json");
const REFRESH = process.argv.includes("--refresh");
const UA = "aims-website-content-import/1.0";
const BASE = "https://aimsuae.me";

const SOURCES = {
  about: "/about",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  warranty: "/zkteco-warranty-policy",
  faq: "/faq",
  installation: "/zkteco-installation-in-uae",
  article:
    "/blog/how-to-choose-an-access-control-system-for-your-business-a-complete-guide-by-aims-security-systems-trading-llc",
} as const;

export const PageSchema = z.object({
  title: z.string(),
  sourceUrl: z.url(),
  blocks: z.array(BlockSchema),
});
const OutputSchema = z.object({
  pages: z.record(z.string(), PageSchema),
  /** Titles of AIMS's blog posts, for the index; only the article above is built here. */
  posts: z.array(z.object({ slug: z.string(), title: z.string() })),
});

const cacheFile = (url: string) => path.join(CACHE, createHash("sha1").update(url).digest("hex") + ".html");
const exists = (p: string) =>
  access(p).then(
    () => true,
    () => false,
  );

async function getHtml(url: string): Promise<string> {
  const file = cacheFile(url);
  if (!REFRESH && (await exists(file))) return readFile(file, "utf8");
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, html);
  return html;
}

const BLOCKISH = "h1,h2,h3,h4,h5,h6,p,ul,ol,div,section,table";

/**
 * The page's body, walked depth first so nested wrappers (the FAQ's accordion items, the article's
 * content div) keep their order. Headings, paragraphs and lists become blocks; text sitting straight
 * inside a wrapper becomes a paragraph; AIMS's wording is kept as published. AIMS's privacy page
 * puts headings and paragraphs directly inside <ul>, so a list's children are read one by one.
 */
function pageBlocks($: cheerio.CheerioAPI): Block[] {
  const pick = (selector: string) => $(selector).first();
  type Sel = ReturnType<typeof pick>;
  const blocks: Block[] = [];
  // AIMS's terms date is written "[30-09-2025]"; the brackets are a leftover, not part of the date.
  const unbracket = (t: string) => t.replace(/\[(\d{2}-\d{2}-\d{4})\]/g, "$1");
  const push = (b: Block) => {
    if (b.type === "ul" ? b.items.length : b.text) blocks.push(b.type === "ul" ? b : { ...b, text: unbracket(b.text) });
  };

  /** Walks a node list with one inline buffer; text and inline tags join into a paragraph. */
  const walk = (el: Sel) => {
    let inline = "";
    const flush = () => {
      push({ type: "p", text: cleanText(inline) });
      inline = "";
    };
    const handle = (node: Sel[number]) => {
      if (node.type === "text") {
        inline += $(node).text();
        return;
      }
      if (node.type !== "tag") return;
      const tag = node.tagName.toLowerCase();
      const $n = $(node);
      if (tag === "script" || tag === "style" || tag === "h1") return;
      if (tag === "br") {
        inline += " ";
        return;
      }
      if (!$n.is(BLOCKISH) && tag !== "li") {
        inline += $n.text();
        return;
      }
      flush();
      if (/^h[2-6]$/.test(tag)) push({ type: "h", text: cleanText($n.text()) });
      else if (tag === "ul" || tag === "ol") readList($n);
      else if (tag === "table") push({ type: "p", text: cleanText($n.text()) });
      else if ($n.children(BLOCKISH).length) walk($n);
      else push({ type: "p", text: cleanText($n.text()) });
    };
    el.contents().each((_, node) => handle(node));
    flush();
  };

  /** A tidy list becomes one block; a list holding headings, paragraphs or nested lists is read item by item. */
  const readList = ($list: Sel) => {
    const kids = $list.children();
    const tidy = kids.toArray().every((k) => k.type === "tag" && k.tagName === "li" && !$(k).children(BLOCKISH).length);
    if (tidy) {
      push({
        type: "ul",
        items: kids
          .map((_, li) => cleanText($(li).text()))
          .get()
          .filter(Boolean),
      });
      return;
    }
    let items: string[] = [];
    const flushItems = () => {
      push({ type: "ul", items });
      items = [];
    };
    kids.each((_, k) => {
      const $k = $(k);
      if (k.type === "tag" && k.tagName === "li" && !$k.children(BLOCKISH).length) {
        const text = cleanText($k.text());
        if (text) items.push(text);
        return;
      }
      flushItems();
      if (k.type === "tag" && /^h[2-6]$/.test(k.tagName)) push({ type: "h", text: cleanText($k.text()) });
      else walk($k);
    });
    flushItems();
  };

  walk(pick(".main"));
  return blocks;
}

async function main() {
  const pages: Record<string, z.infer<typeof PageSchema>> = {};
  for (const [key, route] of Object.entries(SOURCES)) {
    const $ = cheerio.load(await getHtml(BASE + route));
    pages[key] = { title: cleanText($(".main h1").first().text()), sourceUrl: BASE + route, blocks: pageBlocks($) };
    console.log(`${key.padEnd(13)} ${pages[key].blocks.length} blocks  "${pages[key].title}"`);
  }
  const $blog = cheerio.load(await getHtml(`${BASE}/blog`));
  const seen = new Map<string, string>();
  $blog('a[href*="/blog/"]').each((_, a) => {
    const slug = ($blog(a).attr("href") ?? "").split("/blog/")[1]?.replace(/\/$/, "");
    const title = cleanText($blog(a).text());
    // The same slug links twice (image, then title); keep the longest text.
    if (slug && title.length > (seen.get(slug)?.length ?? 0)) seen.set(slug, title);
  });
  const posts = [...seen].map(([slug, title]) => ({ slug, title }));
  console.log(`posts         ${posts.length}`);
  const out = OutputSchema.parse({ pages, posts });
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
