import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/components/icons";
import { softwareBySlug } from "@/content/catalogue";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { BUILT_SOFTWARE } from "@/lib/software";
import { SOFTWARE_STAGE } from "./words";

/**
 * Inside the screen on /software (direction 2): the four platforms AIMS has a page for, each on its family's ground
 * with its own picture on a cream plate, its purpose in AIMS's words and a link to its page. The full list, with the
 * type filter, follows the stage.
 */
export async function SoftwareHubInside() {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.softwareStage;
  const c = t.softwareCentre;
  return (
    <div className="ps-glass ps-hub">
      <p className="ps-head in-mono">{s.head}</p>
      <div className="ps-hub-grid">
        <div className="ps-hub-copy">
          <p className="in-eyebrow">{t.softwarePage.software}</p>
          <h2 className="in-h2">{s.insideTitle}</h2>
          <p className="in-lead">{c.close.body}</p>
        </div>
        <ul className="ps-tiles ps-tiles-plate">
          {BUILT_SOFTWARE.map((slug) => {
            const software = softwareBySlug(slug);
            if (!software) return null;
            const stage = SOFTWARE_STAGE[slug];
            return (
              <li key={slug} style={{ "--ground": `var(--color-family-${stage.ground})` } as CSSProperties}>
                <Link href={localePath(locale, `/software/${slug}`)} className="ps-tile">
                  <span className="ps-tile-word" aria-hidden="true" dir="ltr">
                    {stage.word}
                  </span>
                  {software.image && (
                    <span className="ps-tile-plate">
                      <Image
                        src={software.image.src}
                        alt=""
                        width={software.image.width}
                        height={software.image.height}
                        sizes="140px"
                      />
                    </span>
                  )}
                  <span className="ps-tile-foot">
                    <span>
                      <span className="ps-tile-name" dir="ltr">
                        {software.name}
                      </span>
                      <span className="ps-tile-count in-mono">{c.purpose[slug]}</span>
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
