import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroScroll, type HeroFamily } from "./heroscroll/HeroScroll";
import { FAMILIES } from "@/content/taxonomy";
import { productsInFamily } from "@/content/catalogue";
import { fmt } from "@/i18n/format";
import { HeroTick } from "./HeroTick";

/**
 * T1 hero: the copy over the full-screen scroll scene (heroscroll/, client request 25 Nov 2026): a face of light is
 * scanned and verified as the page scrolls.
 * The headline holds two lines from 1024px, the second the quieter ink-600 line.
 */
export async function Hero() {
  const t = await getDictionary();
  const h = t.home.hero;
  const locale = await getLocale();
  // One photo of AIMS's own per family, whose outline the hero's light forms (heroscroll/productShapes.ts).
  const photos: Record<string, string> = {
    "time-attendance": "/images/home/speedface-cut.png",
    "access-control": "/images/products/f18.webp",
    "entrance-control": "/images/products/ts1000-pro-series.webp",
    "door-locks": "/images/products/tl400.webp",
    "door-hardware": "/images/products/al-280d-led-electric-magnetic-door-lock-model.webp",
    pos: "/images/products/zkaio1000.webp",
  };
  const families: HeroFamily[] = FAMILIES.map((f) => ({
    slug: f.slug,
    name: t.families[f.slug].name,
    summary: t.families[f.slug].summary,
    count: fmt(h.rangeModels, { count: productsInFamily(f.slug).length }),
    href: localePath(locale, `/products/${f.slug}`),
    image: photos[f.slug] ?? "/images/home/speedface-cut.png",
  }));
  return (
    <HeroScroll
      label={h.scene}
      steps={[
        { title: h.step1, body: h.step1Body },
        { title: h.step2, body: h.step2Body },
        { title: h.step3, body: h.step3Body },
      ]}
      stepLabel={h.stepLabel}
      families={families}
      rangeLabel={h.rangeLabel}
      linkLabel={h.rangeLink}
    >
      <div className="home-hero-copy">
        <p className="home-eyebrow">
          <span aria-hidden="true">
            <HeroTick />
          </span>
          {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
        </p>
        <h1 id="home-title" className="home-display">
          <span>
            <span className="home-headline-rise">{h.line1}</span>
          </span>{" "}
          {/* DESIGN.md One Sign Rule: green marks actions, so the second line steps back in ink. */}
          <span className="home-headline-quiet">
            <span className="home-headline-rise">{h.line2}</span>
          </span>
        </h1>
        <p className="home-lead">{h.lead}</p>
        <div className="home-hero-actions">
          <Magnetic>
            <Link href={localePath(locale, "/products")} className="home-button">
              {h.explore}
              <ArrowIcon className="home-action-arrow rtl:-scale-x-100" />
            </Link>
          </Magnetic>
          <Link href={localePath(locale, "/quote")} className="home-secondary">
            {h.quote}
          </Link>
        </div>
        <p className="home-trust">
          <PinIcon width="16" height="16" />
          {h.trust}
        </p>
      </div>
    </HeroScroll>
  );
}
