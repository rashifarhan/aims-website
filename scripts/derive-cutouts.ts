/**
 * Derive trimmed cut-outs from the imported product photographs (pnpm derive:cutouts).
 *
 * AIMS's photographs are products on white with wide white margins, so the product reads small
 * wherever it should stand big and whole (design skill sections.md, Product rule 1: "the product
 * big"). This trims the near-white margin, keeps a small even border, and writes:
 *   public/images/cutouts/<slug>.webp   the trimmed image
 *   content/cutouts.json                { slug: { src, width, height } }, read by src/content/cutouts.ts
 * The source photographs and content/products.json are untouched. Re-run after pnpm import:content.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public/images/cutouts");
/** Near-white tolerance for the trim, and the border kept around the product (share of its long side). */
const THRESHOLD = 18;
const BORDER = 0.04;

type Image = { src: string; width: number; height: number };
type ProductEntry = { slug: string; duplicateOf?: string; images: Image[] };

async function main() {
  const raw = JSON.parse(await readFile(path.join(ROOT, "content/products.json"), "utf8")) as
    ProductEntry[] | { products: ProductEntry[] };
  const products = Array.isArray(raw) ? raw : raw.products;
  await mkdir(OUT_DIR, { recursive: true });
  const out: Record<string, Image> = {};
  for (const p of products) {
    const first = p.images[0];
    if (p.duplicateOf || !first) continue;
    const file = path.join(ROOT, "public", first.src);
    try {
      const trimmed = await sharp(file)
        .flatten({ background: "#ffffff" })
        .trim({ background: "#ffffff", threshold: THRESHOLD })
        .toBuffer({ resolveWithObject: true });
      const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * BORDER);
      const target = path.join(OUT_DIR, `${p.slug}.webp`);
      const info = await sharp(trimmed.data)
        .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#ffffff" })
        .webp({ quality: 82 })
        .toFile(target);
      out[p.slug] = { src: `/images/cutouts/${p.slug}.webp`, width: info.width, height: info.height };
    } catch (error) {
      // A photograph that cannot be trimmed keeps its original framing (the page falls back to it).
      console.warn(`skip ${p.slug}: ${(error as Error).message}`);
    }
  }
  await writeFile(path.join(ROOT, "content/cutouts.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`cut-outs: ${Object.keys(out).length} of ${products.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
