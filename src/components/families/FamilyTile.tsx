import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/components/icons";
import type { FamilySlide } from "./familySlides";
import { GiantWord } from "./GiantWord";

/**
 * A family tile (Design rules → Components): the family's ground, its word sized to the tile, the hero product in
 * front on its floor shadow, the name and the catalogue's model count, linking to the family page.
 */
export function FamilyTile({ family, models }: { family: FamilySlide; models: string }) {
  return (
    <Link
      href={family.href}
      className="fam-tile"
      style={{ "--ground": family.ground, "--w": `${family.tileWidth}%` } as CSSProperties}
    >
      <GiantWord word={family.word} em={family.wordEm} className="fam-tile-word" />
      <span className="fam-tile-shadow" aria-hidden="true" />
      <span className="fam-tile-product">
        <Image
          src={family.hero.src}
          alt=""
          width={family.hero.w}
          height={family.hero.h}
          sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 60vw"
        />
      </span>
      <span className="fam-tile-foot">
        <span>
          <span className="fam-tile-name">{family.name}</span>
          <span className="fam-tile-count">{models.replace("{count}", String(family.count))}</span>
        </span>
        <span className="flood-go" aria-hidden="true">
          <ArrowIcon width="18" height="18" className="rtl:-scale-x-100" />
        </span>
      </span>
    </Link>
  );
}
