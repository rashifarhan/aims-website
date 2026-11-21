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
