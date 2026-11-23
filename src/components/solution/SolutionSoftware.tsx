import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import { isBuiltSoftware } from "@/lib/software";
import { ExternalLink } from "@/components/home/ExternalLink";
import type { SectionCopy } from "./types";

type Item = { slug: string; kind: string; purpose: string };

/**
 * T3 row 6: software that fits. A built software page opens here (Plan 12 #29–31); the others open
 * AIMS's current page, marked ↗, so no card leads to an unbuilt route (CLAUDE.md §6).
 */
export async function SolutionSoftware({
  idPrefix,
  copy,
  items,
}: {
  idPrefix: string;
  copy: SectionCopy;
  items: readonly Item[];
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <section className="t3-section wrap" aria-labelledby={`${idPrefix}-software-title`}>
      <div className="t3-heading">
        <h2 id={`${idPrefix}-software-title`} className="t3-title">
          {copy.heading}
        </h2>
        <p className="t3-lead">{copy.lead}</p>
      </div>
      <ul className="home-software-grid">
        {items.map(({ slug, kind, purpose }) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          const body = (
            <>
              <p className="home-software-kind">{kind}</p>
              <h3 dir="ltr">{software.name}</h3>
              <p className="home-software-purpose">{purpose}</p>
            </>
          );
          return (
            <li key={slug}>
              {isBuiltSoftware(slug) ? (
                <Link href={localePath(locale, `/software/${slug}`)} className="home-software-card">
                  {body}
                </Link>
              ) : (
                <ExternalLink href={software.sourceUrl} label={t.common.externalSite} className="home-software-card">
                  {body}
                </ExternalLink>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
