import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import { FLOW_SOFTWARE } from "@/lib/softwareFlow";
import { ArrowIcon } from "@/components/icons";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SoftwareFlow } from "./SoftwareFlow";

/** Where each platform runs and what it does, restated from its published AIMS summary (Design Doc 12). */
const COPY = {
  biotimecloud: { runs: "runsCloud", purpose: "purposeCloud" },
  "biotime-9-5": { runs: "runsAttendance", purpose: "purposeAttendance" },
  "zkaccess-3-5": { runs: "runsAccess", purpose: "purposeAccess" },
} as const;

/**
 * T1, the software section (client request, 24 Nov 2026): out of the families band into a section of its own, so the
 * platforms that run the hardware get a screen. The records-flow drawing leads; below it, the three platforms are open
 * rows (DESIGN.md Plinth Rule), in the drawing's order, each whole row opening its built page (Plan 12 #29–31).
 * Hovering a row brings its lines forward in the drawing (colour and opacity only, home/sections.css).
 */
export async function HomeSoftware() {
  const t = await getDictionary();
  const s = t.home.software;
  const locale = await getLocale();
  return (
    <Section id="software" labelledBy="software-title" className="home-sw">
      <SectionHeader
        id="software-title"
        title={s.heading}
        lead={s.lead}
        link={
          <Link href={localePath(locale, "/software")} className="home-text-link">
            {s.centre}
            <ArrowIcon width="16" height="16" className="home-action-arrow" />
          </Link>
        }
      />
      <SoftwareFlow />
      <ul className="home-row-list home-sw-rows">
        {FLOW_SOFTWARE.map((slug) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          return (
            <li key={slug}>
              <Link href={localePath(locale, `/software/${slug}`)} className="home-row" data-sw-key={slug}>
                {/* A label, not an action: ink-600 (DESIGN.md One Sign Rule). */}
                <p className="home-row-label">{s[COPY[slug].runs]}</p>
                <h3 className="home-row-code">
                  <span dir="ltr">{software.name}</span>
                  <ArrowIcon width="16" height="16" className="home-action-arrow" />
                </h3>
                <p className="home-row-body">{s[COPY[slug].purpose]}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
