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

/** T1 row 6: software strip; full pages are planned, so cards open AIMS's current pages. */
export async function HomeSoftware() {
  const t = await getDictionary();
  const s = t.home.software;
  return (
    <section className="home-section page-container" aria-labelledby="software-title">
      <div className="home-section-heading">
        <div>
          <h2 id="software-title" className="home-section-title">
            {s.heading}
          </h2>
          <p className="home-section-lead">{s.lead}</p>
        </div>
        <ExternalLink href={LIVE_AIMS.software} label={t.common.externalSite} className="home-text-link">
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
                <h3 dir="ltr">{software.name}</h3>
                <p className="home-software-purpose">{s[purpose]}</p>
              </ExternalLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
