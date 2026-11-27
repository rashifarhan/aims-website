import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { FAMILY_SHOW, type FamilyShow } from "./familyShowcase";

/** A family flood with everything it says filled in from the dictionary and the catalogue (CLAUDE.md, Truth). */
export type FamilySlide = FamilyShow & {
  name: string;
  summary: string;
  heroAlt: string;
  count: number;
  rangeLine: string;
  href: string;
  productHref: string;
};

export function familySlides(t: Dictionary, locale: Locale): FamilySlide[] {
  return FAMILY_SHOW.map((f) => {
    const count = productsInFamily(f.slug).length;
    const product = productBySlug(f.hero.productSlug);
    return {
      ...f,
      name: t.families[f.slug].name,
      summary: t.families[f.slug].summary,
      heroAlt: product?.images[0]?.alt ?? product?.name ?? f.hero.model,
      count,
      rangeLine: `${t.home.stage.models.replace("{count}", String(count))} · ${t.home.stage.ranges[f.slug]}`,
      href: localePath(locale, `/products/${f.slug}`),
      productHref: localePath(locale, `/product/${f.hero.productSlug}`),
    };
  });
}
