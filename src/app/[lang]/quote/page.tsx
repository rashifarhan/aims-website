import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PAGE_FLOOD } from "@/components/families/pageFloods";
import { QuoteView } from "@/components/quote/QuoteView";
import type { CatalogEntry } from "@/components/quote/QuoteItems";
import { products, softwareList } from "@/content/catalogue";
import { fmt } from "@/i18n/format";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import "@/components/quote/quote.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  // A personal list: useful to visit, not to index.
  return {
    title: t.quote.metaTitle,
    robots: { index: false, follow: true },
    alternates: alternates(await getLocale(), "/quote"),
  };
}

export default async function QuotePage() {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  // Names, models and thumbnails for lines saved in the browser.
  const catalog: Record<string, CatalogEntry> = Object.fromEntries(
    products().map((p) => [p.slug, { name: p.name, model: p.model, image: p.images[0]?.src ?? null }]),
  );
  // Software requests a link may carry (/quote?software=<slug>, from the software pages): the line's text, and its
  // picture under the line's id. Only these slugs are accepted.
  const software: Record<string, string> = {
    guidance: t.softwareCentre.guidanceLine,
    ...Object.fromEntries(softwareList().map((s) => [s.slug, fmt(t.softwarePage.line, { name: s.name })])),
  };
  for (const s of softwareList())
    catalog[`software-${s.slug}`] = { name: s.name, model: "", image: s.image?.src ?? null };

  return (
    <main id="main" data-quote-page className="w-full flex-1">
      <PageHero
        flood={PAGE_FLOOD.quote}
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/quote"), label: t.quote.metaTitle },
        ]}
        title={t.quote.title}
        lead={t.quote.lead}
      />
      <div className="wrap pb-(--section-space)">
        <QuoteView
          catalog={catalog}
          software={software}
          t={t.quote}
          stepper={{ qty: t.catalogue.qty, decrease: t.catalogue.decrease, increase: t.catalogue.increase }}
          hrefs={{ products: href("/products"), productBase: href("/product") }}
        />
      </div>
    </main>
  );
}
