import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { isBuiltSoftware } from "@/lib/software";
import { softwareList } from "@/content/catalogue";
import { SoftwareCard } from "@/components/software/SoftwareCard";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { SoftwareFilter, SoftwareFilterView, type SoftwareFilterItem } from "@/components/software/SoftwareFilter";
import "@/components/catalogue/catalogue.css";
import "@/components/software/software.css";

export async function generateMetadata(): Promise<Metadata> {
  const { softwareCentre: c } = await getDictionary();
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: alternates(await getLocale(), "/software"),
  };
}

/** Built platforms first, in the order the navigation lists them (src/lib/nav.ts), then the rest. */
const ORDER = ["biotime-9-5", "biotimecloud", "zkaccess-3-5"];
const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);

/**
 * T6 Software Download Centre (Master Plan 12 #4, 14; Design Doc 10.1): title and one action, type
 * filters in the URL, one card per AIMS software page, and a closing band. No file is published yet,
 * so the action is an installation quote, never a download (CLAUDE.md §1).
 */
export default async function SoftwareCentre() {
  const t = await getDictionary();
  const c = t.softwareCentre;
  const locale = await getLocale();
  const href = (path: string) => localePath(locale, path);
  const items: SoftwareFilterItem[] = [...softwareList()]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((software) => ({
      slug: software.slug,
      types: software.types,
      card: (
        <SoftwareCard
          software={software}
          href={isBuiltSoftware(software.slug) ? href(`/software/${software.slug}`) : null}
          labels={{
            types: c.types,
            purpose: c.purpose[software.slug as keyof typeof c.purpose] ?? "",
            open: c.open.replace("{name}", software.name),
            external: t.common.externalSite,
          }}
        />
      ),
    }));
  const filter = {
    items,
    basePath: href("/software"),
    labels: { label: c.filterLabel, all: c.all, types: c.types, count: c.count, countOne: c.countOne },
  };
  return (
    <main id="main">
      <PageHero
        variant="compact"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/software"), label: t.softwarePage.software },
        ]}
        title={c.title}
        lead={c.lead}
        primary={{ href: href("/quote?need=install"), label: c.primary }}
      />
      <section className="sw-centre wrap" aria-labelledby="sw-centre-list">
        {/* Names the region and keeps headings in order (h1, h2, card h3s), without a second visible title. */}
        <h2 id="sw-centre-list" className="sr-only">
          {c.listHeading}
        </h2>
        <Suspense fallback={<SoftwareFilterView {...filter} active={null} />}>
          <SoftwareFilter {...filter} />
        </Suspense>
      </section>
      <ClosePanel
        id="sw-centre-close"
        heading={c.close.heading}
        body={c.close.body}
        action={{ href: href("/quote?need=install"), label: c.primary }}
      />
    </main>
  );
}
