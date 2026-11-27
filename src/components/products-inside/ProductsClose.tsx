import Link from "next/link";
import { StagePill } from "@/components/inside/StagePill";
import type { FamilySlug } from "@/content/taxonomy";
import { FAMILY_ORDER } from "./stages";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

/**
 * The products pages' close on night (direction 2 rhythm: paper list, then night): supply and installation with the
 * way to the quote, and the six families as their giant words, each a link to its page (the current one in lime).
 */
export async function ProductsClose({ current }: { current?: FamilySlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.productsStage;
  return (
    <section className="pc in-night" aria-labelledby="products-close-title">
      <div className="pc-copy">
        <p className="in-eyebrow">{s.closeEyebrow}</p>
        <h2 id="products-close-title" className="in-h2">
          {t.product.needInstall}
        </h2>
        <p className="in-lead">{t.product.needInstallBody}</p>
        <div className="pc-actions">
          <StagePill href={localePath(locale, "/quote")}>{t.catalogue.viewQuote}</StagePill>
          <Link href={localePath(locale, "/services")} className="in-link">
            {t.nav.services}
          </Link>
        </div>
      </div>
      <nav className="pc-families" aria-label={current ? s.otherFamilies : s.allFamilies}>
        <p className="in-mono" aria-hidden="true">
          {current ? s.otherFamilies : s.allFamilies}
        </p>
        <ul dir="ltr">
          {FAMILY_ORDER.map((slug) => (
            <li key={slug}>
              <Link href={localePath(locale, `/products/${slug}`)} aria-current={slug === current ? "page" : undefined}>
                {/* The giant word is the link's look; its name says the family in full (and in Arabic). */}
                <span aria-hidden="true">{t.home.inside.families[slug].word}</span>
                <span className="sr-only">{t.families[slug].name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
