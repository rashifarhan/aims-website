import Image from "next/image";
import type { FamilyShow } from "./familyShowcase";
import { FloodPieces } from "./FloodPieces";
import { GiantWord } from "./GiantWord";

/**
 * A family flood's drawing in the 1440 × 900 frame (families.css): the giant word, the floor shadow, AIMS's photograph
 * of the family's hero model and the floating accessories. Shared by the home slider's floods and the family pages.
 */
export function FloodFrame({ show, alt, priority = false }: { show: FamilyShow; alt: string; priority?: boolean }) {
  const u = (v: number) => `calc(${v} * var(--u))`;
  return (
    <div className="fam-frame">
      <div className="fam-layer" data-layer="word">
        <GiantWord word={show.word} em={show.wordEm} className="fam-word" />
      </div>
      <div className="fam-layer" data-layer="shadow">
        <span className="fam-shadow" />
      </div>
      <div className="fam-layer" data-layer="hero">
        <div className="fam-hero" style={{ left: u(show.hero.x), top: u(show.hero.y), width: u(show.hero.width) }}>
          <Image
            src={show.hero.src}
            alt={alt}
            width={show.hero.w}
            height={show.hero.h}
            sizes="(min-width: 768px) 40vw, 60vw"
            // The page's LCP image (CLAUDE.md §3); Next 16 replaced `priority` with these.
            loading={priority ? "eager" : undefined}
            fetchPriority={priority ? "high" : undefined}
          />
        </div>
      </div>
      <FloodPieces bits={show.bits.filter((b) => !b.blur)} layer="bits" />
      <FloodPieces bits={show.bits.filter((b) => b.blur)} layer="corner" />
    </div>
  );
}
