import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { SOLUTION_CARDS } from "@/content/solutions";

// The product the solutions hub pictures for this need, so both pages show the same terminal.
const HERO_PRODUCT = SOLUTION_CARDS.find((card) => card.slug === "time-attendance")?.product ?? "f18";

/**
 * T3 row 1: title, promise and two actions beside AIMS's own product photograph (Master Plan 14;
 * taste photos.md "the product leads"). It enters once on load like the homepage hero (solution.css).
 */
export async function SolutionIntro() {
  const t = await getDictionary();
  const c = t.solutionTimeAttendance;
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const photo = productBySlug(HERO_PRODUCT)?.images[0];
  return (
    <div className="t3-intro page-container">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: href("/"), label: t.common.home },
          { href: href("/solutions"), label: t.nav.solutions },
          { href: href("/solutions/time-attendance"), label: t.solutions["time-attendance"].name },
        ]}
      />
      <div className="t3-hero">
        <div className="t3-hero-copy">
          <p className="t3-eyebrow t3-enter">{c.eyebrow}</p>
          <h1 className="t3-enter">{c.title}</h1>
          <p className="t3-promise t3-enter">{c.lead}</p>
          <div className="t3-actions t3-enter">
            <Link href={href("/quote?need=install")} className="home-button">
              {c.primary}
              <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
            </Link>
            <Link href={href("/products/time-attendance")} className="home-secondary">
              {fmt(c.secondary, { count: productsInFamily("time-attendance").length })}
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
