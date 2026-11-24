import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import type { BuiltSoftware } from "@/lib/software";
import { ArrowIcon } from "@/components/icons";
import { Ridges } from "@/components/ui/Ridges";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** The three platforms with built pages (Plan 12 #29–31), with where each runs and what it does (Design Doc 12). */
const PLATFORMS = [
  { slug: "biotime-9-5", runs: "runsAttendance", purpose: "purposeAttendance" },
  { slug: "biotimecloud", runs: "runsCloud", purpose: "purposeCloud" },
  { slug: "zkaccess-3-5", runs: "runsAccess", purpose: "purposeAccess" },
] as const satisfies readonly { slug: BuiltSoftware; runs: string; purpose: string }[];

/**
 * T1 software, premium pass (client decision 6, 24 Nov 2026): a calm night band over the ridge motif. The heading,
 * lead and link on the start side; the three platforms as open rows on the end side, each name in Plex Mono linking
 * to its built page, with where it runs and what it does.
 */
export async function HomeSoftware() {
  const t = await getDictionary();
  const s = t.home.software;
  const locale = await getLocale();
  return (
    <Section ground="night" id="software" labelledBy="software-title" className="home-sw">
      <Ridges className="home-sw-ridges" />
      <div className="home-sw-grid">
        <SectionHeader
          id="software-title"
          title={s.heading}
          lead={s.lead}
          link={
            <Link href={localePath(locale, "/software")} className="home-secondary">
              {s.centre}
              <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
            </Link>
          }
        />
        <ul className="home-sw-list">
          {PLATFORMS.map(({ slug, runs, purpose }) => {
            const software = softwareBySlug(slug);
            if (!software) return null;
            return (
              <li key={slug}>
                <div>
                  <h3>
                    <Link href={localePath(locale, `/software/${slug}`)} className="home-sw-name" dir="ltr">
                      {software.name}
                    </Link>
                  </h3>
                  <p className="home-sw-runs">{s[runs]}</p>
                </div>
                <p className="home-sw-purpose">{s[purpose]}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
