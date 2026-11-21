import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { productBySlug } from "@/content/catalogue";
import type { Product } from "@/content/schema";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { compareRows } from "@/lib/compare";
import { MAX_COMPARE } from "@/lib/filters";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  // A compare view is a personal selection, not a page to index.
  return { title: t.compare.title, robots: { index: false, follow: true } };
}

/** Only listing URLs on this site are accepted as the "Back to results" target. */
const safeFrom = (from: unknown) =>
  typeof from === "string" && /^\/(ar\/)?products(\/[a-z-]+)?(\?[^\s]*)?$/.test(from) ? from : null;

export default async function ComparePage({ searchParams }: PageProps<"/[lang]/products/compare">) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  return (
    <main id="main" className="mx-auto w-full max-w-(--container-page) flex-1 px-4 pt-6 pb-16 sm:px-6">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: href("/"), label: t.common.home },
          { href: href("/products"), label: t.catalogue.allTitle },
          { href: href("/products/compare"), label: t.compare.title },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.compare.title}</h1>
      <Suspense fallback={<p className="mt-4 text-ink-600">{t.compare.lead}</p>}>
        {searchParams.then((sp) => (
          <CompareView t={t} hrefOf={href} params={sp} contentLang={locale === "en" ? undefined : "en"} />
        ))}
      </Suspense>
    </main>
  );
}

function CompareView({
  t,
  hrefOf,
  params,
  contentLang,
}: {
  t: Dictionary;
  hrefOf: (p: string) => string;
  params: Record<string, string | string[] | undefined>;
  contentLang?: string;
}) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const requested = (one(params.items) ?? "").split(",").filter(Boolean).slice(0, MAX_COMPARE);
  const items = requested.map((s) => productBySlug(s)).filter((p): p is Product => !!p);
  const onlyDiff = one(params.diff) === "1";
  const from = safeFrom(one(params.from)) ?? hrefOf("/products");
  const backToResults = (
    <Link
      href={from}
      className="inline-flex h-11 items-center font-semibold text-green-700 underline underline-offset-2"
    >
      ← {t.compare.back}
    </Link>
  );

  if (items.length < 2) {
    return (
      <div className="mt-6 rounded-lg border border-line bg-paper-2 p-6">
        <p className="text-lg font-semibold">{t.compare.empty}</p>
        <div className="mt-3">{backToResults}</div>
      </div>
    );
  }

  const rows = compareRows(items);
  const visible = onlyDiff ? rows.filter((r) => r.differs) : rows;
  const selfHref = (diff: boolean) =>
    `?items=${items.map((p) => p.slug).join(",")}${diff ? "&diff=1" : ""}&from=${encodeURIComponent(from)}`;
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
    <>
      <p className="mt-3 max-w-2xl text-ink-600">{t.compare.lead}</p>
      {requested.length > items.length && <p className="mt-2 text-sm text-warn">{t.compare.notFound}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
        {backToResults}
        <Link
          href={selfHref(!onlyDiff)}
          replace
          scroll={false}
          className="inline-flex h-11 items-center text-sm font-semibold text-ink-700 underline underline-offset-2"
        >
          {onlyDiff ? t.compare.showAll : t.compare.onlyDiff}
        </Link>
      </div>

      {/* Phones: product names stay pinned; each row shows its label above the values (no sideways scroll). */}
      <div className="mt-6 sm:hidden" lang={contentLang}>
        <ul
          className="sticky top-15 z-10 -mx-4 grid gap-3 border-b border-line bg-paper/96 px-4 py-3 backdrop-blur-md"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((p) => (
            <li key={p.slug} className="min-w-0">
              <div className="relative mb-2 aspect-square w-14 overflow-hidden rounded-sm border border-line bg-white">
                {p.images[0] && <Image src={p.images[0].src} alt="" fill sizes="56px" className="object-contain p-1" />}
              </div>
              <Link
                href={hrefOf(`/product/${p.slug}`)}
                className="block text-sm leading-snug font-semibold hover:underline"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul>
          {visible.map((r) => (
            <li key={r.label} className={`-mx-4 border-b border-line px-4 py-3 ${r.differs ? "bg-green-50" : ""}`}>
              <p className="text-sm font-semibold text-ink-700">
                {r.label}
                {r.differs && (
                  <span className="ms-2 inline-block rounded-pill bg-green-100 px-2 text-xs font-semibold text-green-800">
                    {t.compare.differs}
                  </span>
                )}
              </p>
              {r.hint && <p className="mt-0.5 text-xs leading-snug text-ink-600">{r.hint}</p>}
              <dl
                className="mt-2 grid gap-3"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
              >
                {r.values.map((v, i) => (
                  <div key={items[i].slug} className="min-w-0">
                    <dt className="sr-only">{items[i].name}</dt>
                    <dd className="text-sm break-words text-ink">
                      {v ?? <span className="text-ink-600 italic">{t.product.notListed}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <ul className="mt-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((p) => (
            <li key={p.slug} className="min-w-0">
              <p className="mb-2 truncate text-sm font-semibold">{p.model}</p>
              <AddToQuote slug={p.slug} name={p.name} labels={addLabels} />
            </li>
          ))}
        </ul>
      </div>

      {/* From 640px: a real table with a header row of products. */}
      <div className="mt-6 hidden sm:block">
        <table className="w-full border-collapse text-start text-sm" lang={contentLang}>
          <thead>
            <tr className="align-top">
              <td className="w-56" />
              {items.map((p) => (
                <th key={p.slug} scope="col" className="px-3 pb-4 text-start font-normal">
                  <div className="relative mb-3 aspect-square w-32 overflow-hidden rounded-md border border-line bg-white">
                    {p.images[0] && (
                      <Image src={p.images[0].src} alt="" fill sizes="128px" className="object-contain p-2" />
                    )}
                  </div>
                  <Link href={hrefOf(`/product/${p.slug}`)} className="block font-semibold text-ink hover:underline">
                    {p.name}
                  </Link>
                  <span className="mt-0.5 block font-mono text-xs text-ink-600">{p.model}</span>
                  <AddToQuote slug={p.slug} name={p.name} labels={addLabels} className="mt-3" />
                  {items.length > 2 && (
                    <Link
                      href={`?items=${items
                        .filter((x) => x !== p)
                        .map((x) => x.slug)
                        .join(",")}${onlyDiff ? "&diff=1" : ""}&from=${encodeURIComponent(from)}`}
                      replace
                      className="mt-2 inline-flex items-center text-xs font-medium text-ink-600 underline"
                    >
                      {t.compare.remove}
                      <span className="sr-only"> {p.name}</span>
                    </Link>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.label} className={`border-t border-line align-top ${r.differs ? "bg-green-50" : ""}`}>
                <th scope="row" className="py-3 ps-2 pe-3 text-start font-normal">
                  <span className="font-medium text-ink-700">{r.label}</span>
                  {r.differs && (
                    <span className="ms-2 inline-block rounded-pill bg-green-100 px-2 text-xs font-semibold text-green-800">
                      {t.compare.differs}
                    </span>
                  )}
                  {r.hint && <span className="mt-1 block text-xs leading-snug text-ink-600">{r.hint}</span>}
                </th>
                {r.values.map((v, i) => (
                  <td key={items[i].slug} className="px-3 py-3">
                    {v ?? <span className="text-ink-600 italic">{t.product.notListed}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
