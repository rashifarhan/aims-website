import { localePath, type Locale } from "@/i18n/config";
import { productsInFamily } from "@/content/catalogue";
import { FAMILY_SHOW } from "./familyShowcase";
import type { FamilySlide } from "./FamilySlider";

/** The showcase families with their live model counts and links, for either hero exploration. */
export function previewSlides(locale: Locale): FamilySlide[] {
  return FAMILY_SHOW.map((f) => ({
    ...f,
    count: productsInFamily(f.slug).length,
    href: localePath(locale, `/products/${f.slug}`),
    productHref: localePath(locale, `/product/${f.hero.productSlug}`),
  }));
}
