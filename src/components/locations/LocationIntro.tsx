import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";

type Copy = { eyebrow: string; title: string; lead: string; primary: string; secondary: string };
type Photo = { src: string; alt: string; width: number; height: number };

/**
 * T2/T7 row 1 on the T3 hero (ui/sections.css): place title, fulfilment badge as the eyebrow, two actions and one
 * hard fact beside AIMS's own product photograph (Design Doc 10.1 T7). It enters once on load, then stands.
 */
export async function LocationIntro({
  crumbs,
  copy,
  hrefs,
  fact,
  photo,
}: {
  crumbs: Crumb[];
  copy: Copy;
  hrefs: { primary: string; secondary: string };
  /** The first screen's one hard fact (taste House rule 5): the showroom address or the confirmed status. */
  fact: ReactNode;
  photo?: Photo;
}) {
  const t = await getDictionary();
  return (
    <div className="t3-intro wrap">
      <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
      <div className="t3-hero">
        <div className="t3-hero-copy">
          <p className="t3-eyebrow t3-enter">{copy.eyebrow}</p>
          <h1 className="t3-enter">{copy.title}</h1>
          <p className="t3-promise t3-enter">{copy.lead}</p>
          <div className="t3-actions t3-enter">
            <Link href={hrefs.primary} className="home-button">
              {copy.primary}
              <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
            </Link>
            <Link href={hrefs.secondary} className="home-secondary">
              {copy.secondary}
            </Link>
          </div>
          <p className="loc-fact t3-enter">{fact}</p>
        </div>
        {photo && (
          <div className="t3-hero-photo">
            {/* The LCP element on desktop: preloaded, sized, never shifts (CLAUDE.md §5). */}
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 30rem, 16rem"
              preload
            />
          </div>
        )}
      </div>
    </div>
  );
}
