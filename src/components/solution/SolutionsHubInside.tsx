import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/components/icons";
import { SOLUTION_STAGES } from "@/components/products-inside/stages";
import { SOLUTION_CARDS } from "@/content/solutions";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

/**
 * Inside the controller's face on /solutions (direction 2): the five needs as tiles, each on its family's ground with
 * the product its own page stands on, its outcome in AIMS's words, and a link to that page.
 */
export async function SolutionsHubInside() {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.solutionsStage;
  return (
    <div className="ps-glass ps-hub">
      <p className="ps-head in-mono">{s.head}</p>
      <div className="ps-hub-grid">
        <div className="ps-hub-copy">
          <p className="in-eyebrow">{s.eyebrow}</p>
          <h2 className="in-h2">{s.insideTitle}</h2>
          <p className="in-lead">{t.solutionsHub.lead}</p>
        </div>
        <ul className="ps-tiles">
          {SOLUTION_CARDS.map(({ slug, family }) => {
            const stage = SOLUTION_STAGES[slug];
            return (
              <li key={slug} style={{ "--ground": `var(--color-family-${family})` } as CSSProperties}>
                <Link href={localePath(locale, `/solutions/${slug}`)} className="ps-tile">
                  <span className="ps-tile-word" aria-hidden="true" dir="ltr">
                    {t.home.inside.families[family].word}
                  </span>
                  <Image src={stage.image.src} alt="" width={stage.image.w} height={stage.image.h} sizes="160px" />
                  <span className="ps-tile-foot">
                    <span>
                      <span className="ps-tile-name">{t.solutions[slug].name}</span>
                      <span className="ps-tile-count in-mono">{t.solutionsHub.cards[slug].outcome}</span>
                    </span>
                    <span className="ps-tile-arrow" aria-hidden="true">
                      <ArrowIcon width="16" height="16" className="rtl:-scale-x-100" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
