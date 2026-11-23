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
}: {
  idPrefix: string;
  page: Pick<SolutionPageData, "family" | "quote">;
  copy: CtaCopy;
}) {
  const locale = await getLocale();
  return (
    <section className="t3-cta page-container" aria-labelledby={`${idPrefix}-cta-title`}>
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
          <Link href={localePath(locale, `/products/${page.family}`)} className="home-text-link">
            {copy.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
