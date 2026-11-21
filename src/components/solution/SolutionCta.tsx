import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";

/** T3 row 8: closing band, one action and one link (Design Doc 2, principle 1). */
export async function SolutionCta() {
  const { solutionTimeAttendance: c } = await getDictionary();
  const locale = await getLocale();
  return (
    <section className="t3-cta page-container" aria-labelledby="ta-cta-title">
      <div className="t3-cta-panel">
        <div>
          <h2 id="ta-cta-title" className="t3-title">
            {c.cta.heading}
          </h2>
          <p className="t3-lead">{c.cta.body}</p>
        </div>
        <div className="t3-cta-actions">
          <Link href={localePath(locale, "/quote?need=install")} className="home-button">
            {c.cta.action}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
          <Link href={localePath(locale, "/products/time-attendance")} className="home-text-link">
            {c.cta.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
