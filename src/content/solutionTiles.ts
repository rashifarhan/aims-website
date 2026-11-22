import "server-only";
import { localePath, type Locale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { productBySlug, productsInFamily } from "./catalogue";
import { typesFor, type FamilySlug, type ProductType } from "./taxonomy";
import type { MethodTile } from "@/components/solution/kit/MethodTiles";
import type { Method } from "./schema";

/**
 * One tile: a product, and the listing of every model of its kind (a type or a verification
 * method in a family, or the whole family).
 */
export type TileSpec = {
  label: string;
  slug: string;
  family: FamilySlug;
  type?: ProductType;
  verify?: Method;
  all: string;
};

/** Models of a type in a family, counted the way the listing's type facet counts them. */
export const countOfType = (family: FamilySlug, type?: ProductType) =>
  productsInFamily(family).filter((p) => !type || typesFor(p.sourceCategories).includes(type)).length;

/** Models with a verification method in a family, counted the way the listing's method facet counts them. */
const countOfMethod = (family: FamilySlug, method: Method) =>
  productsInFamily(family).filter((p) => p.methods.includes(method)).length;

/**
 * Resolve tile specs into MethodTiles props: the product from the catalogue, and a link to the
 * filtered listing whose label carries the same count the listing shows (CLAUDE.md §1, §6).
 */
export function solutionTiles(locale: Locale, specs: TileSpec[]): MethodTile[] {
  return specs.flatMap((s) => {
    const product = productBySlug(s.slug);
    if (!product) return [];
    const query = s.type ? `?type=${s.type}` : s.verify ? `?verify=${s.verify}` : "";
    const count = s.verify ? countOfMethod(s.family, s.verify) : countOfType(s.family, s.type);
    return [
      {
        label: s.label,
        product,
        all: {
          href: localePath(locale, `/products/${s.family}${query}`),
          label: fmt(s.all, { count }),
        },
      },
    ];
  });
}
