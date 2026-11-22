import { getDictionary } from "@/i18n/dictionaries";
import { softwareBySlug } from "@/content/catalogue";
import { LIVE_AIMS } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";

/** Purpose lines restate each platform's published AIMS summary in one sentence (Design Doc 12). */
const ENTRIES = [
  { slug: "biotime-9-5", kind: "attendance", purpose: "purposeAttendance" },
  { slug: "biotimecloud", kind: "cloud", purpose: "purposeCloud" },
  { slug: "zkaccess-3-5", kind: "access", purpose: "purposeAccess" },
] as const;

/**
 * T1 row 6, set inside the product-families section on night green: the software that runs the hardware
 * above it. A strip of its own was under half a screen (taste skill layout-v4: no strip sections).
 * Full software pages are planned, so the cards open AIMS's current pages.
 */
export async function HomeSoftware() {
  const t = await getDictionary();
  const s = t.home.software;
  return (
    <div className="home-software-block">
      <div className="home-section-heading">
        <div>
          <h3 id="software-title" className="home-subtitle">
            {s.heading}
          </h3>
          <p className="home-night-lead">{s.lead}</p>
        </div>
        <ExternalLink href={LIVE_AIMS.software} label={t.common.externalSite} className="home-night-link">
          {s.centre}
        </ExternalLink>
      </div>
      <ul className="home-software-grid">
        {ENTRIES.map(({ slug, kind, purpose }) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          return (
            <li key={slug}>
              <ExternalLink href={software.sourceUrl} label={t.common.externalSite} className="home-software-card">
                <p className="home-software-kind">{s[kind]}</p>
                <h4 dir="ltr">{software.name}</h4>
                <p className="home-software-purpose">{s[purpose]}</p>
              </ExternalLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
