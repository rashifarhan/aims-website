import "server-only";
import productsJson from "../../content/products.json";
import softwareJson from "../../content/software.json";
import type { Product, Software } from "./schema";
import type { FamilySlug } from "./taxonomy";

/** Typed access to the imported catalogue (validated at import time). */
const all = productsJson as Product[];
const software = softwareJson as Software[];

/** Products shown on the site: duplicates are hidden (they 301 to the canonical). */
export const products = (): Product[] => all.filter((p) => !p.duplicateOf);
export const productCount = () => products().length;
export const productBySlug = (slug: string) => all.find((p) => p.slug === slug && !p.duplicateOf);
export const productsInFamily = (family: FamilySlug) => products().filter((p) => p.family === family);
export const softwareList = (): Software[] => software;
export const softwareBySlug = (slug: string) => software.find((s) => s.slug === slug);

/**
 * A unique display name. Two AIMS pages share a title (zkbio810 is titled
 * "ZKAIO1000", see import report), so the URL slug disambiguates.
 */
export function uniqueName(p: Product): string {
  const clash = products().some((o) => o.slug !== p.slug && o.name === p.name);
  return clash ? `${p.name} (${p.slug})` : p.name;
}

/**
 * "Often fitted with" (Design Doc 10, T5) only when the product's own spec
 * sheet says it drives a lock and an exit button; the items are AIMS's
 * standard door hardware.
 */
export const FITTED_WITH = ["al-m280", "alf-b21-exit-button", "id-card-thin"] as const;

export function fittedWith(p: Product): Product[] {
  const iface = p.specs
    .flatMap((g) => g.rows)
    .find((r) => r.label === "Access control interface")
    ?.value.toLowerCase();
  if (!iface || !/lock/.test(iface) || !/exit/.test(iface)) return [];
  return FITTED_WITH.map((s) => productBySlug(s)).filter((x): x is Product => !!x && x.slug !== p.slug);
}
