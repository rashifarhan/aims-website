import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import { TA_SOFTWARE } from "@/content/timeAttendance";
import { navigationHref } from "@/lib/navigationHref";
import { ExternalLink } from "@/components/home/ExternalLink";

/** T3 row 6: software that fits. Software pages are planned, so cards open AIMS's current pages. */
export async function SolutionSoftware() {
  const t = await getDictionary();
  const c = t.solutionTimeAttendance.software;
  const locale = await getLocale();
  return (
    <section className="t3-section page-container" aria-labelledby="ta-software-title">
      <div className="t3-heading">
        <h2 id="ta-software-title" className="t3-title">
          {c.heading}
        </h2>
        <p className="t3-lead">{c.lead}</p>
      </div>
      <ul className="home-software-grid">
        {TA_SOFTWARE.map(({ slug, kind, purpose }) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          const href = navigationHref(localePath(locale, `/software/${slug}`));
          return (
            <li key={slug}>
              <ExternalLink href={href} label={t.common.externalSite} className="home-software-card">
                <p className="home-software-kind">{c[kind]}</p>
                <h3 dir="ltr">{software.name}</h3>
                <p className="home-software-purpose">{c[purpose]}</p>
              </ExternalLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
