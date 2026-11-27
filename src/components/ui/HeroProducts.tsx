import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { productBySlug } from "@/content/catalogue";
import { HERO_SETS, type HeroSetName } from "./heroSets";

type Props = { name: HeroSetName; shown: string; href: (path: string) => string };

/**
 * A set of AIMS's own products on the hero's light plinth, in place of a drawn scene (ui/heroSets.ts). The photos are
 * decorative here; the line under the plinth names each model and links to its page, as the home stage's "Shown" chip
 * does. A slug the catalogue no longer has is left out rather than drawn as a gap.
 */
export function HeroProducts({ name, shown, href }: Props) {
  const pieces = HERO_SETS[name].flatMap((piece) => {
    const p = productBySlug(piece.slug);
    const image = p?.images[0];
    return p && image ? [{ ...piece, p, image }] : [];
  });
  return (
    <>
      <div className="hero-set" aria-hidden="true">
        {pieces.map(({ slug, x, y, w, image }) => (
          <Image
            key={slug}
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 18rem, 40vw"
            className="hero-set-piece"
            style={{ "--x": x, "--y": y, "--w": w } as CSSProperties}
          />
        ))}
      </div>
      <p className="hero-set-shown">
        <span className="hero-set-label">{shown}</span>
        {pieces.map(({ slug, p }, i) => (
          <span key={slug}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <Link href={href(`/product/${slug}`)} dir="ltr" className="hero-set-model">
              {p.model}
            </Link>
          </span>
        ))}
      </p>
    </>
  );
}
