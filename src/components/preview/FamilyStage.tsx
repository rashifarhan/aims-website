import Image from "next/image";
import type { CSSProperties } from "react";
import type { FamilyShow } from "./familyShowcase";

/** One family's stage: its ground, giant word, product and floating pieces, laid out on the 1440 × 900 frame. */
export function FamilyStage({ slide, phase, dir }: { slide: FamilyShow; phase: "first" | "in" | "out"; dir: number }) {
  const u = (v: number) => `calc(${v} * var(--u))`;
  return (
    <div
      className="fs-slide"
      data-phase={phase}
      data-dir={dir > 0 ? "next" : "prev"}
      style={{ background: slide.ground }}
    >
      <div className="fs-frame">
        <p className="fs-word" aria-hidden="true" style={{ "--len": slide.word.length } as CSSProperties}>
          {slide.word}
        </p>
        <span className="fs-shadow" style={{ left: u(720 - 190), top: u(790), width: u(380), height: u(34) }} />
        <div
          className="fs-hero"
          style={{ left: u(slide.hero.x), top: u(slide.hero.y), width: u(slide.hero.width) } as CSSProperties}
        >
          <Image
            src={slide.hero.src}
            alt={slide.hero.alt}
            width={slide.hero.w}
            height={slide.hero.h}
            sizes="(min-width: 1024px) 40vw, 70vw"
            priority={phase === "first"}
          />
        </div>
        {slide.bits.map((b, i) => (
          <div
            key={i}
            className={b.blur ? "fs-bit fs-bit-blur" : "fs-bit"}
            style={
              {
                left: u(b.x),
                top: u(b.y),
                width: u(b.width),
                "--r": `${b.rotate}deg`,
                "--d": b.depth,
                "--i": i,
              } as CSSProperties
            }
          >
            <Image src={b.img.src} alt="" width={b.img.w} height={b.img.h} sizes="20vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
