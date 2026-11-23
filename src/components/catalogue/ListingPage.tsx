import { Suspense } from "react";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { products, productsInFamily } from "@/content/catalogue";
import { toCard } from "@/content/cards";
import { FAMILIES, type FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { Listing, ListingView, type ListingProps } from "./Listing";
import "./catalogue.css";

/**
 * Server part of the T4 listing: heading and data. The interactive list
 * reads the URL, so it sits in <Suspense>; the fallback is the same list
 * unfiltered, which is what crawlers and no-JS visitors get.
 */
export async function ListingPage({ family }: { family?: FamilySlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);

  const list = (family ? productsInFamily(family) : products()).map(toCard);
  const familyNames = Object.fromEntries(FAMILIES.map((f) => [f.slug, t.families[f.slug].name]));
  const title = family ? t.families[family].name : t.catalogue.allTitle;
  const lead = family
    ? fmt(t.catalogue.familyLead, { count: list.length })
    : fmt(t.catalogue.allLead, { count: list.length });

  const props: ListingProps = {
    cards: list,
    family,
    t: t.catalogue,
    familyNames,
    hrefs: { product: href("/product"), compare: href("/products/compare"), quote: href("/quote") },
  };

  return (
    <main id="main" className="flex-1">
      <PageHero
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          ...(family ? [{ href: href("/products"), label: t.catalogue.allTitle }] : []),
          { href: href(family ? `/products/${family}` : "/products"), label: title },
        ]}
        title={title}
        lead={lead}
      />
      <div className="wrap">
        <Suspense fallback={<ListingView {...props} />}>
          <Listing {...props} />
        </Suspense>
      </div>
      {/* The close where the page sells (taste sections.md): the install note and the way to the quote. */}
      <ClosePanel
        id="listing-close"
        heading={t.product.needInstall}
        body={t.product.needInstallBody}
        action={{ href: href("/quote"), label: t.catalogue.viewQuote }}
      />
    </main>
  );
}
