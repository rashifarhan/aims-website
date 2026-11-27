import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { FamilySlide } from "./familySlides";
import { FloodFrame } from "./FloodFrame";

/**
 * One family's flood: its ground, giant word, AIMS's photograph of a real model with its floor shadow, the floating
 * accessories (CLAUDE.md → Design rules → Imagery), and the family's own caption, "Shown" chip and range link, which
 * travel with the flood when it is wiped away. The frame's layers carry `data-layer` so the scroll leaf can move
 * each one by its own travel (lib/familyStage.ts).
 */
export function FamilyStage({
  slide,
  index,
  total,
  priority,
  labels,
}: {
  slide: FamilySlide;
  index: number;
  total: number;
  priority: boolean;
  labels: { shown: string; range: string };
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <article
      className="fam-slide flood"
      id={`family-${slide.slug}`}
      aria-labelledby={`family-${slide.slug}-name`}
      data-index={index}
      style={{ "--ground": slide.ground } as CSSProperties}
    >
      <FloodFrame show={slide} alt={slide.heroAlt} priority={priority} />

      <div className="fam-slide-ui">
        <h2 className="fam-name" id={`family-${slide.slug}-name`}>
          <span className="fam-count" aria-hidden="true">
            <b>{pad(index + 1)}</b> / {pad(total)}
          </span>
          {slide.name}
        </h2>
        <p className="sr-only">{slide.summary}</p>
        <Link href={slide.productHref} className="fam-chip">
          <Image src={slide.hero.src} alt="" width={40} height={40} className="fam-chip-thumb" />
          <span>
            <small>{labels.shown}</small>
            <b dir="ltr">{slide.hero.model}</b>
          </span>
        </Link>
        <Link href={slide.href} className="fam-range">
          <span className="fam-range-label">{labels.range}</span>
          <small>{slide.rangeLine}</small>
        </Link>
      </div>
    </article>
  );
}
