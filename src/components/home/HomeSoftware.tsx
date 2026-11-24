import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import { ArrowIcon } from "@/components/icons";

/** Purpose lines restate each platform's published AIMS summary in one sentence (Design Doc 12). */
const ENTRIES = [
  { slug: "biotime-9-5", kind: "attendance", purpose: "purposeAttendance" },
  { slug: "biotimecloud", kind: "cloud", purpose: "purposeCloud" },
  { slug: "zkaccess-3-5", kind: "access", purpose: "purposeAccess" },
] as const;

/**
 * T1 row 6, set inside the product-families band: the software that runs the hardware
 * above it. A strip of its own was under half a screen (taste skill layout-v4: no strip sections).
 * Open rows, not cards (DESIGN.md Plinth Rule: text-only content stands on the ground under a hairline); each whole
 * row opens its built software page (Plan 12 #29–31).
 */
export async function HomeSoftware() {
  const t = await getDictionary();
  const s = t.home.software;
  const locale = await getLocale();
  return (
    <div className="home-software-block">
      <div className="section-heading">
        <div>
          <h3 id="software-title" className="home-subtitle">
            {s.heading}
          </h3>
          <p className="section-lead">{s.lead}</p>
        </div>
        <Link href={localePath(locale, "/software")} className="home-text-link">
          {s.centre}
          <ArrowIcon width="16" height="16" className="home-action-arrow" />
        </Link>
      </div>
      <ul className="home-row-list">
        {ENTRIES.map(({ slug, kind, purpose }) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          return (
            <li key={slug}>
              <Link href={localePath(locale, `/software/${slug}`)} className="home-row">
                <p className="home-row-label">{s[kind]}</p>
                <h4 className="home-row-code">
                  <span dir="ltr">{software.name}</span>
                  <ArrowIcon width="16" height="16" className="home-action-arrow" />
                </h4>
                <p className="home-row-body">{s[purpose]}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
