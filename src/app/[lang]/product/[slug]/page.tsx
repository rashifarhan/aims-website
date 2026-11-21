import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ArrowIcon } from "@/components/icons";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { Overview } from "@/components/product/Overview";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { SpecTable } from "@/components/product/SpecTable";
import { fittedWith, productBySlug, products, uniqueName } from "@/content/catalogue";
import { keyFacts } from "@/content/facts";
import type { FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { absoluteUrl, alternates, fitTitle } from "@/lib/seo";
import { whatsappUrl } from "@/lib/site";

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
  // Product data is English; mark it so Arabic pages read it correctly.
  const contentLang = locale === "en" ? undefined : "en";
  const family = p.family as FamilySlug;
  const familyName = t.families[family].name;
  const tiles = keyFacts(p, 4);
  const fitted = fittedWith(p);
  const image = p.images[0];
  const name = uniqueName(p);

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
    <main id="main" className="page-container flex-1 pt-6 pb-28 lg:pb-16">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: href("/"), label: t.common.home },
          { href: href(`/products/${family}`), label: familyName },
          { href: href(`/product/${p.slug}`), label: p.model },
        ]}
      />

      {/* Summary */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
          {image && (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-contain p-8"
            />
          )}
        </div>

        <div lang={contentLang}>
          <p className="text-brand font-semibold tracking-brand text-ink-600 uppercase">
            {p.brand === "alpha" ? "Alpha" : "ZKTeco"} · {familyName}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {name}
          </h1>
          <p className="mt-1 font-mono text-base text-ink-600">{p.model}</p>
          <p className="mt-4 max-w-[60ch] text-lg text-ink-600">{p.summary}</p>

          {tiles.length > 0 && (
            <section aria-labelledby="key-specs" className="mt-6">
              <h2 id="key-specs" className="sr-only">
                {t.product.keySpecs}
              </h2>
              <dl className="grid grid-cols-2 gap-2">
                {tiles.map((f) => (
                  <div key={f.label} className="flex flex-col-reverse rounded-md bg-paper-2 p-4">
                    <dt className="mt-1 text-caption text-ink-600">{f.label}</dt>
                    <dd className="text-lg leading-snug font-semibold text-ink tabular-nums">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <ProductPurchase
            slug={p.slug}
            name={p.name}
            model={p.model}
            quoteHref={href("/quote")}
            whatsappHref={whatsappUrl(
              fmt(t.product.whatsappText, { name: `${p.name} (${absoluteUrl(`/product/${p.slug}`)})` }),
            )}
            labels={{ ...addLabels, viewQuote: t.catalogue.viewQuote, askWhatsapp: t.product.askWhatsapp }}
          />

          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {p.datasheetUrl && (
              <li>
                <a
                  href={p.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline underline-offset-2"
                >
                  {t.product.datasheet}
                  <span className="font-normal text-ink-600"> · {t.product.datasheetNote}</span>
                </a>
              </li>
            )}
            <li>
              <Link
                href={href(`/products/${family}?cmp=${p.slug}`)}
                className="text-green-700 underline underline-offset-2"
              >
                {t.product.compareSimilar}
              </Link>
            </li>
          </ul>

          <div className="mt-6 rounded-md border border-line p-4">
            <p className="font-semibold text-ink">{t.product.needInstall}</p>
            <p className="mt-1 text-sm text-ink-600">{t.product.needInstallBody}</p>
          </div>
        </div>
      </div>

      {/* Often fitted with */}
      {fitted.length > 0 && (
        <section aria-labelledby="fitted" className="mt-14">
          <h2 id="fitted" className="text-2xl font-bold tracking-tight">
            {t.product.fittedWith}
          </h2>
          <p className="mt-1 text-sm text-ink-600">{t.product.fittedWithNote}</p>
          <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
            {fitted.map((f) => (
              <li key={f.slug} className="flex items-center gap-4 rounded-md border border-line p-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-sm border border-line bg-white">
                  {f.images[0] && (
                    <Image src={f.images[0].src} alt="" fill sizes="64px" className="object-contain p-1" />
                  )}
                </div>
                <div className="min-w-0 flex-1" lang={contentLang}>
                  <Link href={href(`/product/${f.slug}`)} className="block truncate font-semibold hover:underline">
                    {f.name}
                  </Link>
                  <AddToQuote slug={f.slug} name={f.name} labels={addLabels} className="mt-2" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Specifications */}
      <section aria-labelledby="specs" className="mt-14 grid gap-6 lg:grid-cols-[232px_1fr] lg:gap-10">
        <h2 id="specs" className="text-2xl font-bold tracking-tight">
          {t.product.specs}
        </h2>
        {p.specs.length > 0 ? (
          <SpecTable groups={p.specs} lang={contentLang} />
        ) : (
          <div className="rounded-md bg-paper-2 p-5">
            <p className="text-ink-700">{t.product.noSpecs}</p>
            <a
              href={whatsappUrl(fmt(t.product.whatsappText, { name: p.name }))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-green-700 underline underline-offset-2"
            >
              {t.product.askSpecs}
              <ArrowIcon width={16} height={16} />
            </a>
          </div>
        )}
      </section>

      {/* Overview */}
      {p.overview.length > 0 && (
        <section aria-labelledby="overview" className="mt-14 grid gap-6 lg:grid-cols-[232px_1fr] lg:gap-10">
          <h2 id="overview" className="text-2xl font-bold tracking-tight">
            {t.product.overview}
          </h2>
          <Overview blocks={p.overview} lang={contentLang} />
        </section>
      )}

      {/* Downloads */}
      <section aria-labelledby="downloads" className="mt-14 grid gap-6 lg:grid-cols-[232px_1fr] lg:gap-10">
        <h2 id="downloads" className="text-2xl font-bold tracking-tight">
          {t.product.downloads}
        </h2>
        {p.datasheetUrl ? (
          <a
            href={p.datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-line px-4 py-3 font-semibold hover:border-line-strong"
          >
            {t.product.datasheet} <span className="font-mono text-sm font-normal text-ink-600">{p.model}</span>
            <span className="text-sm font-normal text-ink-600">· {t.product.datasheetNote}</span>
          </a>
        ) : (
          <p className="text-ink-600">{t.product.noDatasheet}</p>
        )}
      </section>

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
