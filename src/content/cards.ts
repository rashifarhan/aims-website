import { keyFacts } from "./facts";
import { typesFor, type FamilySlug, type ProductType } from "./taxonomy";
import type { Connectivity, Method, Product, SpecRow } from "./schema";

/**
 * The slim record the listing, search and quote UI need on the client.
 * Full specs stay on the server (product and compare pages).
 */
export type ProductCard = {
  slug: string;
  name: string;
  model: string;
  brand: Product["brand"];
  family: FamilySlug;
  types: ProductType[];
  verify: Method[];
  conn: Connectivity[];
  outdoor: boolean;
  facts: SpecRow[];
  image: { src: string; width: number; height: number } | null;
  /** Extra search words: label, family, slug parts, common trade terms. */
  keywords: string;
};

/** Trade shorthand people type that AIMS's names spell out. */
const TRADE_TERMS: [RegExp, string][] = [
  [/electro ?magnetic|magnetic (door )?lock|\bmag lock/i, "em lock maglock"],
  [/turnstile|tripod|speed gate|flap/i, "turnstile gate"],
  [/barrier/i, "barrier boom parking"],
  [/exit button|push button/i, "exit button rex"],
  [/drop ?bolt/i, "drop bolt"],
  [/\bstrike\b/i, "strike"],
];

export function toCard(p: Product): ProductCard {
  const text = `${p.name} ${p.summary}`;
  const trade = TRADE_TERMS.filter(([re]) => re.test(text)).map(([, words]) => words);
  const img = p.images[0];
  return {
    slug: p.slug,
    name: p.name,
    model: p.model,
    brand: p.brand,
    family: p.family as FamilySlug,
    types: typesFor(p.sourceCategories),
    verify: p.methods,
    conn: p.connectivity,
    outdoor: p.outdoor,
    facts: keyFacts(p),
    image: img ? { src: img.src, width: img.width, height: img.height } : null,
    keywords: [p.label ?? "", p.slug.replace(/-/g, " "), ...trade].join(" "),
  };
}
