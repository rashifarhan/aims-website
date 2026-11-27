import Image from "next/image";
import type { CSSProperties } from "react";
import type { Bit } from "./familyShowcase";

/**
 * A layer of floating accessories on a flood, positioned in the 1440 × 900 frame (`--u`). Each piece floats on its
 * own clock and drifts with the pointer by its depth (families.css); the blurred corner pieces are a layer of their
 * own because they travel furthest when a family arrives. All are decoration: `alt=""`.
 */
export function FloodPieces({ bits, layer }: { bits: Bit[]; layer: "bits" | "corner" }) {
  const u = (v: number) => `calc(${v} * var(--u))`;
  return (
    <div className="fam-layer" data-layer={layer} aria-hidden="true">
      {bits.map((b, i) => (
        <div
          key={`${b.img.src}-${b.x}`}
          className={b.blur ? "fam-bit fam-bit-blur" : "fam-bit"}
          style={
            {
              left: u(b.x),
              top: u(b.y),
              width: u(b.width),
              "--r": `${b.rotate}deg`,
              "--d": b.depth,
              "--i": i + (layer === "corner" ? 4 : 0),
            } as CSSProperties
          }
        >
          <Image src={b.img.src} alt="" width={b.img.w} height={b.img.h} sizes="(min-width: 768px) 16vw, 24vw" />
        </div>
      ))}
    </div>
  );
}
