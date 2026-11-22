import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import type { SolutionPageData } from "@/content/solutionPages";
import type { IntroCopy } from "./types";

/**
 * T3 row 1: title, promise and two actions beside AIMS's own product photograph (Master Plan 14;
 * taste photos.md "the product leads"). It enters once on load like the homepage hero (solution.css).
 */
export async function SolutionIntro({ page, copy }: { page: SolutionPageData; copy: IntroCopy }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const photo = productBySlug(page.hero)?.images[0];
  return (
    <div className="t3-intro page-container">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: href("/"), label: t.common.home },
          { href: href("/solutions"), label: t.nav.solutions },
          { href: href(`/solutions/${page.slug}`), label: t.solutions[page.slug].name },
        ]}
      />
      <div className="t3-hero">
        <div className="t3-hero-copy">
          <p className="t3-eyebrow t3-enter">{copy.eyebrow}</p>
          <h1 className="t3-enter">{copy.title}</h1>
          <p className="t3-promise t3-enter">{copy.lead}</p>
          <div className="t3-actions t3-enter">
            <Link href={href(page.quote)} className="home-button">
              {copy.primary}
              <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
            </Link>
            <Link href={href(`/products/${page.family}`)} className="home-secondary">
              {fmt(copy.secondary, { count: productsInFamily(page.family).length })}
            </Link>
          </div>
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
