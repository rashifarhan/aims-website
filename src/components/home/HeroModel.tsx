import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { productBySlug } from "@/content/catalogue";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";

/** The catalogue entry for the terminal in the hero photograph (its model and methods come from content). */
const HERO_MODEL = "zkteco-speedface-v5l-qr";

/** Names the hero's device and links to its product page, so the photograph is a real, findable model. */
export async function HeroModel() {
  const product = productBySlug(HERO_MODEL);
  if (!product) return null;
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <div className="home-model">
      {/* CLAUDE.md §7: model codes stay left-to-right inside Arabic. */}
      <bdi dir="ltr" className="home-model-code">
        {product.model}
      </bdi>
      <span className="home-model-type">{t.home.hero.modelType}</span>
      <Link href={localePath(locale, `/product/${product.slug}`)} className="home-text-link">
        {t.home.hero.viewModel}
        <span className="sr-only"> {product.model}</span>
        <ArrowIcon className="home-action-arrow rtl:-scale-x-100" />
      </Link>
    </div>
  );
}
