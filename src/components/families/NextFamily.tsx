import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/components/icons";
import type { FamilySlug } from "@/content/taxonomy";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { familySlides } from "./familySlides";
import { FloodFrame } from "./FloodFrame";

/**
 * The end of a family page: the next family's flood, so a buyer can walk the six families page by page the way the
 * home slider walks them by scroll (CLAUDE.md → Design rules: floods and chalk alternate).
 */
export async function NextFamily({ family }: { family: FamilySlug }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const slides = familySlides(t, locale);
  const i = slides.findIndex((s) => s.slug === family);
  const next = slides[(i + 1) % slides.length];
  if (i < 0 || !next) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section
      className="nf flood"
      aria-labelledby="next-family-title"
      style={{ "--ground": next.ground } as CSSProperties}
    >
      <FloodFrame show={next} alt="" />
      <div className="nf-copy">
        <p className="nf-kicker">
          <span className="fam-count" aria-hidden="true">
            <b>{pad(slides.indexOf(next) + 1)}</b> / {pad(slides.length)}
          </span>
          {t.catalogue.nextFamily}
        </p>
        <h2 id="next-family-title" className="nf-title">
          {next.name}
        </h2>
        <p className="nf-line">{next.rangeLine}</p>
        <Link href={next.href} className="home-button">
          {fmt(t.catalogue.seeFamily, { name: next.name })}
          <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
