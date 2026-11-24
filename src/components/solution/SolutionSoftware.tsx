import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import { isBuiltSoftware } from "@/lib/software";
import { ExternalLink } from "@/components/home/ExternalLink";
import type { SectionCopy } from "./types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";
import { Ridges } from "@/components/ui/Ridges";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";

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
    <Section ground="night" labelledBy={`${idPrefix}-software-title`} className="t3-software-band">
      <Ridges className="t3-software-ridges" />
      <SectionHeader id={`${idPrefix}-software-title`} title={copy.heading} lead={copy.lead} />
      <SpotlightGroup className="t3-software-spot">
        <ul className="home-software-grid">
          {items.map(({ slug, kind, purpose }) => {
            const software = softwareBySlug(slug);
            if (!software) return null;
            // AIMS's own picture of the platform gives each card its visual (taste House rule 7).
            const body = (
              <>
                {software.image && (
                  <span className="t3-software-image">
                    <Image
                      src={software.image.src}
                      alt=""
                      width={software.image.width}
                      height={software.image.height}
                      sizes="4.5rem"
                    />
                  </span>
                )}
                <p className="home-software-kind">{kind}</p>
                <h3 dir="ltr">{software.name}</h3>
                <p className="home-software-purpose">{purpose}</p>
              </>
            );
            return (
              <li key={slug}>
                {isBuiltSoftware(slug) ? (
                  <Link
                    href={localePath(locale, `/software/${slug}`)}
                    className="home-software-card ui-card ui-card-interactive spotlight-card"
                  >
                    {body}
                  </Link>
                ) : (
                  <ExternalLink
                    href={software.sourceUrl}
                    label={t.common.externalSite}
                    className="home-software-card ui-card ui-card-interactive spotlight-card"
                  >
                    {body}
                  </ExternalLink>
                )}
              </li>
            );
          })}
        </ul>
      </SpotlightGroup>
    </Section>
  );
}
