import { splitModel } from "./modelCode";

/**
 * Models in the home model-code strip (premium pass, client decision 7). A curated list of well-known AIMS
 * products, by slug; a slug missing from the catalogue is skipped, never invented (CLAUDE.md §1).
 */
export const STRIP_SLUGS = [
  "f18",
  "zkteco-speedface-v5l-qr",
  "inbio-pro-460",
  "proface-x",
  "bio-pro-sa20",
  "barrier-gates-bgm-1045",
  "al-m280",
  "zkaio1000",
  "sface-lite",
  "bioface-b1",
  "iface900",
  "inbio-pro-260",
] as const;

export type StripItem = { slug: string; code: string };

type StripSource = { slug: string; model: string };

/** The strip's items in list order: the display code is the model field before AIMS's description. */
export function pickStripItems(
  lookup: (slug: string) => StripSource | undefined,
  slugs: readonly string[] = STRIP_SLUGS,
): StripItem[] {
  return slugs.flatMap((slug) => {
    const p = lookup(slug);
    return p ? [{ slug: p.slug, code: splitModel(p.model).code }] : [];
  });
}
