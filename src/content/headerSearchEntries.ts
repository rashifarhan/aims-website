import "server-only";
import { products, softwareList } from "./catalogue";
import { FAMILIES } from "./taxonomy";
import { SOLUTIONS } from "@/lib/nav";
import { navigationHref } from "@/lib/navigationHref";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SearchEntry } from "@/lib/searchSuggestions";

/** Send only compact, public search labels to the client, never the full specifications. */
export function headerSearchEntries(t: Dictionary, locale: Locale): SearchEntry[] {
  const familyNames = new Map(FAMILIES.map((family) => [family.slug as string, t.families[family.slug].name]));
  return [
    ...products().map((product) => ({
      label: product.name,
      href: localePath(locale, `/product/${product.slug}`),
      kind: "product" as const,
      keywords: `${product.model} ${product.methods.join(" ")} ${familyNames.get(product.family) ?? product.family}`,
    })),
    ...softwareList().map((software) => ({
      label: software.name,
      href: software.sourceUrl,
      kind: "software" as const,
      keywords: software.types.join(" "),
    })),
    ...SOLUTIONS.map((slug) => ({
      label: t.solutions[slug].name,
      href: navigationHref(localePath(locale, `/solutions/${slug}`)),
      kind: "solution" as const,
      keywords: slug.replaceAll("-", " "),
    })),
  ];
}
