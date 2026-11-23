import Link from "next/link";
import { getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";
import type { SolutionPageData } from "@/content/solutionPages";
import type { CtaCopy } from "./types";

/** T3 row 8: closing band, one action and one link (Design Doc 2, principle 1). */
export async function SolutionCta({
  idPrefix,
  page,
  copy,
  secondaryHref,
  embedded = false,
}: {
  idPrefix: string;
  page: Pick<SolutionPageData, "quote"> & Partial<Pick<SolutionPageData, "family">>;
  copy: CtaCopy;
  /** The secondary link when it isn't the page's family listing (the T7 location pages link the hub). */
  secondaryHref?: string;
  /** Inside SolutionQuestions' section (the solution pages): no container or section padding of its own. */
  embedded?: boolean;
}) {
  const locale = await getLocale();
  const secondary = secondaryHref ?? (page.family ? `/products/${page.family}` : "/products");
  return (
    <section
      className={embedded ? "t3-cta t3-cta-embedded" : "t3-cta page-container"}
      aria-labelledby={`${idPrefix}-cta-title`}
    >
      <div className="t3-cta-panel">
        <div>
          <h2 id={`${idPrefix}-cta-title`} className="t3-title">
            {copy.heading}
          </h2>
          <p className="t3-lead">{copy.body}</p>
        </div>
        <div className="t3-cta-actions">
          <Link href={localePath(locale, page.quote)} className="home-button">
            {copy.action}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
          <Link href={localePath(locale, secondary)} className="home-text-link">
            {copy.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
