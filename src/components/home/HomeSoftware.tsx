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
 * T1 row 6, set inside the product-families section on night green: the software that runs the hardware
 * above it. A strip of its own was under half a screen (taste skill layout-v4: no strip sections).
 * Cards open the built software pages (Plan 12 #29–31).
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
          <p className="home-night-lead">{s.lead}</p>
        </div>
        <Link href={localePath(locale, "/software")} className="home-night-link">
          {s.centre}
          <ArrowIcon width="16" height="16" className="home-action-arrow" />
        </Link>
      </div>
      <ul className="home-software-grid">
        {ENTRIES.map(({ slug, kind, purpose }) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          return (
            <li key={slug}>
              <Link
                href={localePath(locale, `/software/${slug}`)}
                className="home-software-card ui-card ui-card-interactive"
              >
                {/* The name leads (craft floor: no label above a heading); the kind and the arrow close the
                    card the way the family cards above close on their count. */}
                {/* The name stays left-to-right but sits on the card's start edge in Arabic too (Design Doc 13). */}
                <h4>
                  <bdi dir="ltr">{software.name}</bdi>
                </h4>
                <p className="home-software-purpose">{s[purpose]}</p>
                <p className="home-software-foot">
                  <span className="home-software-kind">{s[kind]}</span>
                  <ArrowIcon width="16" height="16" className="home-action-arrow" />
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
