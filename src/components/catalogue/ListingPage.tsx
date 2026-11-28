import { Suspense } from "react";
import { PageHead } from "@/components/inside/PageHead";
import { SmoothScroll } from "@/components/inside/SmoothScroll";
import { ProductsClose } from "@/components/products-inside/ProductsClose";
import { FAMILY_ORDER } from "@/components/products-inside/stages";
import { products, productsInFamily } from "@/content/catalogue";
import { toCard } from "@/content/cards";
import { FAMILIES, type FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { Listing, ListingView, type ListingProps } from "./Listing";
import "@/components/inside/inside.css";
import "@/components/inside/skin.css";
import "@/components/products-inside/products-inside.css";
import "./catalogue.css";

/**
 * The products hub and the six family pages, direction 2 (CLAUDE.md → Design rules): a short night head (crumbs, the
 * H1, the count) and at once the list on paper, the families as tabs on top · the close on night. No stage and no
 * dive here (client decision, 28 Nov 2026): a visitor who picked a category came for its products, so the first
 * screen shows them. The interactive list reads the URL, so it sits in <Suspense>; the fallback is the same list
 * unfiltered, which is what crawlers and no-JS visitors get.
 */
export async function ListingPage({ family }: { family?: FamilySlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.productsStage;
  const href = (p: string) => localePath(locale, p);

  const all = products();
  const list = (family ? productsInFamily(family) : all).map(toCard);
  const familyNames = Object.fromEntries(FAMILIES.map((f) => [f.slug, t.families[f.slug].name]));
  const title = family ? t.families[family].name : t.catalogue.allTitle;
  const listingHref = href(family ? `/products/${family}` : "/products");

  const tabs = [
    { slug: null, label: s.tabAll, count: all.length, href: href("/products") },
    ...FAMILY_ORDER.map((slug) => ({
      slug,
      label: t.families[slug].name,
      count: productsInFamily(slug).length,
      href: href(`/products/${slug}`),
    })),
  ];

  const props: ListingProps = {
    cards: list,
    family,
    t: t.catalogue,
    familyNames,
    hrefs: {
      listing: listingHref,
      product: href("/product"),
      compare: href("/products/compare"),
      quote: href("/quote"),
      solutions: href("/solutions"),
      showroom: `${href("/about")}#showrooms`,
    },
    familyTabs: { mode: family ? "link" : "filter", label: s.tabsLabel, tabs },
  };

  const crumbs = [
    { href: href("/"), label: t.common.home },
    ...(family ? [{ href: href("/products"), label: t.catalogue.allTitle }] : []),
    { href: listingHref, label: title },
  ];

  return (
    <main id="main" className="d2 flex-1">
      <PageHead
        crumbs={crumbs}
        title={title}
        lead={
          family
            ? fmt(s.familyLead, { count: list.length, summary: t.families[family].summary })
            : fmt(s.hubLead, { count: list.length })
        }
        action={{ href: href("/quote"), label: s.quote }}
      />

      <section id="products" className="pl in-paper" aria-label={title}>
        <div className="wrap">
          <Suspense fallback={<ListingView {...props} />}>
            <Listing {...props} />
          </Suspense>
        </div>
      </section>

      <ProductsClose current={family} />
      <SmoothScroll />
    </main>
  );
}
