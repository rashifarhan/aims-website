import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CompareStack } from "@/components/catalogue/CompareStack";
import { CompareTable } from "@/components/catalogue/CompareTable";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { ArrowIcon } from "@/components/icons";
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
    <main id="main" className="flex-1">
      <PageHero
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/products"), label: t.catalogue.allTitle },
          { href: href("/products/compare"), label: t.compare.title },
        ]}
        title={t.compare.title}
        lead={
          // The lead describes the table, so it shows only once two products are selected.
          <Suspense fallback={t.compare.lead}>
            {searchParams.then((sp) => (selection(sp).items.length < 2 ? null : t.compare.lead))}
          </Suspense>
        }
      />
      <Suspense fallback={null}>
        {searchParams.then((sp) => (
          <CompareView t={t} hrefOf={href} params={sp} contentLang={locale === "en" ? undefined : "en"} />
        ))}
      </Suspense>
    </main>
  );
}

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** The products named in the URL that exist, capped at MAX_COMPARE (URL params are untrusted input). */
function selection(params: Params) {
  const requested = (one(params.items) ?? "").split(",").filter(Boolean).slice(0, MAX_COMPARE);
  return { requested, items: requested.map((s) => productBySlug(s)).filter((p): p is Product => !!p) };
}

function CompareView({
  t,
  hrefOf,
  params,
  contentLang,
}: {
  t: Dictionary;
  hrefOf: (p: string) => string;
  params: Params;
  contentLang?: string;
}) {
  const { requested, items } = selection(params);
  const onlyDiff = one(params.diff) === "1";
  const from = safeFrom(one(params.from)) ?? hrefOf("/products");
  const backToResults = (
    <Link href={from} className="home-secondary gap-1.5">
      {/* "Back" points to the inline start: the outer flip turns ArrowIcon (→, mirrored in Arabic by
          its own rtl:-scale-x-100) into ← in English and → in Arabic (Design Doc 13). */}
      <span className="inline-flex -scale-x-100">
        <ArrowIcon width={18} height={18} />
      </span>
      {t.compare.back}
    </Link>
  );

  if (items.length < 2) {
    return (
      <div className="wrap pb-(--section-space)">
        <div className="ui-panel">
          <p className="text-lg font-semibold">{t.compare.empty}</p>
          <div className="mt-3">{backToResults}</div>
        </div>
      </div>
    );
  }

  const rows = compareRows(items, t.product.specHints);
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

  const productHref = (slug: string) => hrefOf(`/product/${slug}`);
  const removeHref = (p: Product) =>
    items.length > 2
      ? `?items=${items
          .filter((x) => x !== p)
          .map((x) => x.slug)
          .join(",")}${onlyDiff ? "&diff=1" : ""}&from=${encodeURIComponent(from)}`
      : null;
  const shared = { items, rows: visible, t, addLabels, productHref, contentLang };

  return (
    <>
      <div className="wrap">
        {requested.length > items.length && <p className="mb-2 text-sm text-warn">{t.compare.notFound}</p>}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {backToResults}
          <Link href={selfHref(!onlyDiff)} replace scroll={false} className="home-secondary text-sm">
            {onlyDiff ? t.compare.showAll : t.compare.onlyDiff}
          </Link>
        </div>
        <CompareStack {...shared} />
        <CompareTable {...shared} removeHref={removeHref} />
      </div>

      {/* The close where the page sells (taste sections.md): the install note and the way to the quote. */}
      <ClosePanel
        id="compare-close"
        heading={t.product.needInstall}
        body={t.product.needInstallBody}
        action={{ href: hrefOf("/quote"), label: t.catalogue.viewQuote }}
      />
    </>
  );
}
