import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { QuoteView } from "@/components/quote/QuoteView";
import type { CatalogEntry } from "@/components/quote/QuoteItems";
import { products } from "@/content/catalogue";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import "@/components/contact/channel-button.css";
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

  return (
    <main id="main" className="w-full flex-1 bg-paper-2">
      <PageHero
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
          t={t.quote}
          stepper={{ qty: t.catalogue.qty, decrease: t.catalogue.decrease, increase: t.catalogue.increase }}
          hrefs={{ products: href("/products"), productBase: href("/product") }}
        />
      </div>
    </main>
  );
}
