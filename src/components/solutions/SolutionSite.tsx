import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { navigationHref } from "@/lib/navigationHref";
import { ArrowIcon } from "@/components/icons";
import { SITE_POINTS } from "./sitePlan";
import { SitePlanDrawing } from "./SitePlanDrawing";
import "./site-plan.css";

/**
 * The hub's one dealt moment, "One site, five systems" (taste motion.md; Design Doc 8 SIGNAL): when a
 * third of the section is on screen MomentTrigger sets `data-played`, lines draw from the controller to
 * each solution in turn and each point lights once (site-plan.css). The numbered links are the
 * section's content; the plan only shows where each one sits, so the section reads the same without it.
 */
export async function SolutionSite() {
  const t = await getDictionary();
  const locale = await getLocale();
  const copy = t.solutionsHub.site;
  const names = Object.fromEntries(SITE_POINTS.map(({ slug }) => [slug, t.solutions[slug].name])) as Record<
    (typeof SITE_POINTS)[number]["slug"],
    string
  >;
  return (
    <section className="hs-site page-container" data-moment aria-labelledby="site-plan-title">
      <div className="hs-heading">
        <h2 id="site-plan-title">{copy.title}</h2>
        <p className="solution-section-lead">{copy.lead}</p>
      </div>
      {/* Before the list in the DOM so phones see the plan, then its numbered key; desktop sets it beside. */}
      <div className="hs-stage">
        <SitePlanDrawing names={names} />
      </div>
      <ol className="hs-list">
        {SITE_POINTS.map(({ slug }, i) => (
          <li key={slug}>
            <Link href={navigationHref(localePath(locale, `/solutions/${slug}`))} className="hs-link" data-point={slug}>
              <span className="hs-link-index tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hs-link-text">
                <span className="hs-link-name">{t.solutions[slug].name}</span>
                <span className="hs-link-summary">{t.solutions[slug].summary}</span>
              </span>
              <ArrowIcon className="home-action-arrow hs-link-arrow" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
