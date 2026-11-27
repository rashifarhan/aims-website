import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import type { BuiltSoftware } from "@/lib/software";
import { FloodHead } from "@/components/families/FloodHead";
import { FloodSection } from "@/components/families/FloodSection";
import { SoftwareRows, type SoftwareRow } from "./SoftwareRows";

/** The four platforms with built pages, with where each runs and what it does. */
const PLATFORMS = [
  { slug: "biotime-9-5", runs: "runsAttendance", purpose: "purposeAttendance" },
  { slug: "biotimecloud", runs: "runsCloud", purpose: "purposeCloud" },
  { slug: "zkbio-cvsecurity", runs: "runsBrowser", purpose: "purposeCvsecurity" },
  { slug: "zkbio-cvaccess", runs: "runsBrowser", purpose: "purposeCvaccess" },
] as const satisfies readonly { slug: BuiltSoftware; runs: string; purpose: string }[];

/** Software, on chalk (Software menu): open rows beside a white card that shows the row in hand (SoftwareRows). */
export async function HomeSoftware() {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.home.software;
  const rows: SoftwareRow[] = PLATFORMS.flatMap(({ slug, runs, purpose }) => {
    const software = softwareBySlug(slug);
    return software
      ? [
          {
            slug,
            name: software.name,
            image: software.image,
            runs: s[runs],
            purpose: s[purpose],
            href: localePath(locale, `/software/${slug}`),
          },
        ]
      : [];
  });
  return (
    <FloodSection id="software" tone="chalk" labelledBy="software-title">
      <FloodHead
        id="software-title"
        kicker={t.nav.software}
        title={s.heading}
        lead={s.lead}
        link={{ href: localePath(locale, "/software"), label: s.centre }}
      />
      <SoftwareRows rows={rows} />
    </FloodSection>
  );
}
