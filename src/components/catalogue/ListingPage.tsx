import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FamilyFlood } from "@/components/families/FamilyFlood";
import { FAMILY_SHOW } from "@/components/families/familyShowcase";
import { NextFamily } from "@/components/families/NextFamily";
import { ArrowIcon } from "@/components/icons";
import { products, productsInFamily } from "@/content/catalogue";
import { toCard } from "@/content/cards";
import { FAMILIES, type FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { Listing, ListingView, type ListingProps } from "./Listing";
import "@/components/families/flood.css";
import "./catalogue.css";

/**
 * The products hub and the family pages (direction 3). The hub opens on chalk with its heading, the search and the six
 * major categories, which filter the list in place; a family page opens on its own flood and ends on the next
 * family's. The interactive list reads the URL, so it sits in <Suspense>; the fallback is the same list unfiltered,
 * which is what crawlers and no-JS visitors get.
 */
export async function ListingPage({ family }: { family?: FamilySlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);

  const list = (family ? productsInFamily(family) : products()).map(toCard);
  const familyNames = Object.fromEntries(FAMILIES.map((f) => [f.slug, t.families[f.slug].name]));
  const models = (count: number) => fmt(t.catalogue.models, { count });

  const install = (
    <section
      aria-labelledby="install-title"
      className="lst-install flood"
      style={{ "--ground": "var(--color-ground-access)" } as CSSProperties}
    >
      <h2 id="install-title" className="lst-install-title">
        {t.product.needInstall}
      </h2>
      <p>{t.product.needInstallBody}</p>
      <Link href={href("/quote")} className="home-button">
        {t.catalogue.viewQuote}
        <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
      </Link>
    </section>
  );

  const props: ListingProps = {
    cards: list,
    family,
    t: t.catalogue,
    familyNames,
    hrefs: {
      listing: href(family ? `/products/${family}` : "/products"),
      product: href("/product"),
      compare: href("/products/compare"),
      quote: href("/quote"),
      solutions: href("/solutions"),
      showroom: `${href("/about")}#showrooms`,
    },
    aside: install,
    ...(family
      ? {}
      : {
          intro: (
            <div className="lst-intro">
              <Breadcrumbs
                label={t.common.breadcrumb}
                items={[
                  { href: href("/"), label: t.common.home },
                  { href: href("/products"), label: t.catalogue.allTitle },
                ]}
              />
              <h1 className="lst-title">{t.catalogue.allTitle}</h1>
              <p className="lst-lead">{fmt(t.catalogue.allLead, { count: list.length })}</p>
            </div>
          ),
          picker: {
            label: t.catalogue.categories,
            all: { name: t.catalogue.allTitle, count: models(list.length) },
            items: FAMILY_SHOW.map((f) => ({
              slug: f.slug,
              name: t.families[f.slug].name,
              count: models(productsInFamily(f.slug).length),
              word: f.word,
              wordEm: f.wordEm,
              ground: f.ground,
              hero: { src: f.hero.src, w: f.hero.w, h: f.hero.h },
              tileWidth: f.tileWidth,
            })),
          },
        }),
  };

  return (
    <main id="main" className="flex-1">
      {family && <FamilyFlood family={family} />}
      <div id="results" className="lst flood-chalk">
        <div className="wrap">
          <Suspense fallback={<ListingView {...props} />}>
            <Listing {...props} />
          </Suspense>
        </div>
      </div>
      {family && <NextFamily family={family} />}
    </main>
  );
}
