import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ConnectsDiagram } from "@/components/product/ConnectsDiagram";
import { FittedWith } from "@/components/product/FittedWith";
import { Overview } from "@/components/product/Overview";
import { ProductSummary } from "@/components/product/ProductSummary";
import { SpecsSection } from "@/components/product/SpecsSection";
import { connections } from "@/components/product/connects";
import { englishData } from "@/components/product/englishData";
import "@/components/product/product.css";
import { fittedWith, productBySlug, products, uniqueName } from "@/content/catalogue";
import type { FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { absoluteUrl, alternates, fitTitle } from "@/lib/seo";
import { Section } from "@/components/ui/Section";

/**
 * Heading column beside content from 1024px. minmax(0, …) lets long verbatim spec values and overview
 * text wrap inside their column instead of widening the page at 390px (audit T1).
 */
const SECTION = "grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-10";

/** Every live product gets a page from this template (review decision 6). */
export function generateStaticParams() {
  return products().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  if (!p) return {};
  const img = p.images[0];
  return {
    title: fitTitle(uniqueName(p)),
    description: p.summary,
    alternates: alternates(await getLocale(), `/product/${p.slug}`),
    openGraph: img ? { images: [{ url: img.src, width: img.width, height: img.height, alt: p.name }] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const p = productBySlug((await params).slug);
  if (!p) notFound();

  const t = await getDictionary();
  const locale = await getLocale();
  const href = (path: string) => localePath(locale, path);
  const data = englishData(locale);
  const family = p.family as FamilySlug;
  const familyName = t.families[family].name;
  const image = p.images[0];

  const addLabels = {
    add: t.catalogue.add,
    inQuote: t.catalogue.inQuote,
    addedAnnounce: t.catalogue.addedAnnounce,
    qtyAnnounce: t.catalogue.qtyAnnounce,
    qty: t.catalogue.qty,
    decrease: t.catalogue.decrease,
    increase: t.catalogue.increase,
  };

  return (
    // pb-20 below 1024px keeps the last section clear of the sticky purchase bar (audit T3).
    <main id="main" className="flex-1 pb-20 lg:pb-0">
      <div className="wrap pt-6">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href(`/products/${family}`), label: familyName },
            { href: href(`/product/${p.slug}`), label: p.model },
          ]}
        />

        <ProductSummary
          p={p}
          name={uniqueName(p)}
          familyName={familyName}
          href={href}
          addLabels={addLabels}
          t={t}
          data={data}
        />
      </div>

      <ConnectsDiagram
        model={p.model}
        connections={connections(p)}
        connLabels={t.catalogue.conn}
        labels={{ ...t.product.connects, lead: fmt(t.product.connects.lead, { model: p.model }) }}
        sectionClass={SECTION}
        data={data}
      />

      <FittedWith
        items={fittedWith(p)}
        heading={t.product.fittedWith}
        note={t.product.fittedWithNote}
        href={href}
        addLabels={addLabels}
        data={data}
      />

      <SpecsSection
        p={p}
        heading={t.product.specs}
        hints={t.product.specHints}
        empty={{
          body: t.product.noSpecs,
          ask: t.product.askSpecs,
          message: fmt(t.product.whatsappText, { name: p.name }),
        }}
        sectionClass={SECTION}
        data={data}
      />

      {p.overview.length > 0 && (
        <Section labelledBy="overview" className={SECTION}>
          <h2 id="overview" className="section-title">
            {t.product.overview}
          </h2>
          <Overview blocks={p.overview} data={data} />
        </Section>
      )}

      <Section labelledBy="downloads" className={SECTION}>
        <h2 id="downloads" className="section-title">
          {t.product.downloads}
        </h2>
        {p.datasheetUrl ? (
          <a
            href={p.datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit max-w-full flex-wrap items-center gap-x-2 rounded-md border border-line px-4 py-3 font-semibold transition-colors duration-(--duration-hover) hover:border-line-strong active:bg-paper-2"
          >
            {t.product.datasheet}{" "}
            <span className="font-mono text-sm font-normal text-ink-600" dir="ltr">
              {p.model}
            </span>
            <span className="text-sm font-normal text-ink-600">· {t.product.datasheetNote}</span>
          </a>
        ) : (
          <p className="text-ink-600">{t.product.noDatasheet}</p>
        )}
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          sku: p.model,
          mpn: p.model,
          brand: { "@type": "Brand", name: p.brand === "alpha" ? "Alpha" : "ZKTeco" },
          category: t.families[family].name,
          description: p.summary,
          url: absoluteUrl(`/product/${p.slug}`),
          ...(image ? { image: absoluteUrl(image.src) } : {}),
        }}
      />
    </main>
  );
}
