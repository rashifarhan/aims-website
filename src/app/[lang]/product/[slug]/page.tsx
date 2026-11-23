import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { JsonLd } from "@/components/JsonLd";
import { ConnectsDiagram } from "@/components/product/ConnectsDiagram";
import { FittedWith } from "@/components/product/FittedWith";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductSummary } from "@/components/product/ProductSummary";
import { SpecsSection } from "@/components/product/SpecsSection";
import { connections, MIN_CONNECTS_NODES, nodeCount } from "@/components/product/connects";
import { englishData } from "@/components/product/englishData";
import { productGrounds } from "@/components/product/grounds";
import "@/components/product/product.css";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { fittedWith, productBySlug, products, uniqueName } from "@/content/catalogue";
import type { FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { absoluteUrl, alternates, fitTitle } from "@/lib/seo";

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

  const links = connections(p);
  const hasConnects = nodeCount(links) >= MIN_CONNECTS_NODES;
  const fitted = fittedWith(p);
  const grounds = productGrounds({ connects: hasConnects, fitted: fitted.length > 0 });

  return (
    // pb-20 below 1024px keeps the last section clear of the sticky purchase bar (audit T3).
    <main id="main" className="flex-1 pb-20 lg:pb-0">
      <ProductSummary
        p={p}
        name={uniqueName(p)}
        familyName={familyName}
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href(`/products/${family}`), label: familyName },
          { href: href(`/product/${p.slug}`), label: p.model },
        ]}
        href={href}
        addLabels={addLabels}
        t={t}
        data={data}
      />

      <ConnectsDiagram
        model={p.model}
        connections={links}
        connLabels={t.catalogue.conn}
        labels={{ ...t.product.connects, lead: fmt(t.product.connects.lead, { model: p.model }) }}
        data={data}
      />

      <FittedWith
        items={fitted}
        heading={t.product.fittedWith}
        note={t.product.fittedWithNote}
        href={href}
        addLabels={addLabels}
        data={data}
        ground={grounds.fitted}
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
        data={data}
        ground={grounds.specs}
        moment={!hasConnects}
      />

      <ProductDetails
        p={p}
        compareHref={href(`/products/${p.family}?cmp=${p.slug}`)}
        t={t.product}
        data={data}
        ground={grounds.details}
      />

      {/* The close (taste sections.md: a closing panel where the page sells): the install note, this
          product's own Add, and the way on to the quote request (Design Doc 10, T5). */}
      <ClosePanel
        id="product-close"
        heading={t.product.needInstall}
        body={t.product.needInstallBody}
        action={<AddToQuote slug={p.slug} name={p.name} labels={addLabels} size="md" />}
        secondary={{ href: href("/quote"), label: t.catalogue.viewQuote }}
      />

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
