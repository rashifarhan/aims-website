import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import type { FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { familySlides } from "./familySlides";
import { FloodFrame } from "./FloodFrame";
import { FloodToneWrap } from "./FloodToneWrap";
import "./families.css";

/**
 * A family page's opening (HANDOFF: "a family page opens on its own ground and word"): the family's flood as the home
 * slider shows it, still rather than pinned, with the page's breadcrumb and h1, the six families as links, the
 * neighbouring families on the circle arrows and the model count leading down to the list.
 */
export async function FamilyFlood({ family }: { family: FamilySlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const slides = familySlides(t, locale);
  const i = slides.findIndex((s) => s.slug === family);
  const slide = slides[i];
  if (!slide) return null;
  const prev = slides[(i + slides.length - 1) % slides.length] ?? slide;
  const next = slides[(i + 1) % slides.length] ?? slide;
  const s = t.home.stage;

  return (
    <FloodToneWrap>
      <section className="fam fam-page" aria-labelledby="family-title">
        <div className="fam-slide flood" style={{ "--ground": slide.ground } as CSSProperties}>
          <FloodFrame show={slide} alt={slide.heroAlt} priority />
          <div className="fam-ui">
            <nav className="fam-tabs" aria-label={s.tabs}>
              {slides.map((f) => (
                <Link
                  key={f.slug}
                  href={f.href}
                  className="fam-tab"
                  aria-current={f.slug === family ? "page" : undefined}
                >
                  {f.name}
                </Link>
              ))}
            </nav>
            <div className="fam-head fam-page-head">
              <div className="fam-crumbs">
                <Breadcrumbs
                  label={t.common.breadcrumb}
                  items={[
                    { href: href("/"), label: t.common.home },
                    { href: href("/products"), label: t.catalogue.allTitle },
                    { href: slide.href, label: slide.name },
                  ]}
                />
              </div>
              <h1 id="family-title" className="fam-page-title">
                {slide.name}
              </h1>
              <p className="fam-page-lead">{fmt(t.catalogue.familyLead, { count: slide.count })}</p>
            </div>
            <Link href={slide.productHref} className="fam-chip">
              <Image src={slide.hero.src} alt="" width={40} height={40} className="fam-chip-thumb" />
              <span>
                <small>{s.shown}</small>
                <b dir="ltr">{slide.hero.model}</b>
              </span>
            </Link>
            <a href="#results" className="fam-range">
              <span className="fam-range-label">{fmt(s.models, { count: slide.count })}</span>
              <small>{s.ranges[family]}</small>
            </a>
            <Link href={prev.href} className="fam-arrow fam-prev">
              <span className="sr-only">{fmt(s.previous, { name: prev.name })}</span>
              <span className="fam-arrow-ring" aria-hidden="true">
                <ArrowIcon width="20" height="20" className="rotate-180 rtl:rotate-0" />
              </span>
              <em aria-hidden="true">{prev.word}</em>
            </Link>
            <Link href={next.href} className="fam-arrow fam-next">
              <span className="sr-only">{fmt(s.next, { name: next.name })}</span>
              <em aria-hidden="true">{next.word}</em>
              <span className="fam-arrow-ring" aria-hidden="true">
                <ArrowIcon width="20" height="20" className="rtl:rotate-180" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </FloodToneWrap>
  );
}
