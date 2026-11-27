import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { StagePill } from "@/components/inside/StagePill";
import type { FamilySlug } from "@/content/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import type { ProductStage } from "./stages";
import { StageMotion } from "./StageMotion";

type Action = { href: string; label: string };

/** A link with a query string is not prefetched: such links loop through the locale rewrite (lib/prefetchSafe.ts). */
const noPrefetch = (href: string) => (href.includes("?") ? false : undefined);

/** Wider than this (width ÷ height), a product would run into the copy at the start. */
const WIDE = 1.3;

type Props = {
  id: string;
  stage: ProductStage;
  word: string;
  crumbs: Crumb[];
  title?: string;
  lead?: string;
  primary?: Action;
  secondary?: Action;
  /** In place of the H1, lead and links: a product page's purchase ticket. It must hold the H1, `${id}-title`. */
  copy?: ReactNode;
  /** The "Shown: model" link; a product page shows its own product and leaves it out. */
  productHref?: string;
  /** A photograph still on its studio white stands on a cream plate (the white multiplies away); the plate is the
   * screen the dive flies into. */
  plate?: { alt: string };
  /** A family page's ground tints the stage's glow. */
  ground?: FamilySlug;
  /** What opens out of the screen. */
  children: ReactNode;
};

/**
 * A page stage and its dive (direction 2, CLAUDE.md → Design rules): one real AIMS product before one giant word,
 * the H1 and two actions bottom-start. The section pins with CSS sticky; StageMotion, the one client leaf, flies the
 * product forward until its screen fills the stage and opens the page's inside out of it. Without JavaScript or under
 * reduced motion the stage stands and the inside follows it (products-inside.css).
 */
export async function PageStage(props: Props) {
  const { id, stage, word, crumbs, title, lead, primary, secondary, copy, productHref, ground, plate, children } =
    props;
  const t = await getDictionary();
  const s = t.productsStage;
  const style = {
    "--ratio": String(stage.image.w / stage.image.h),
    // Small source photographs (the POS models) stand smaller, so they never blur.
    "--native": `${Math.round(stage.image.h * 1.6)}px`,
    "--letters": String(word.length),
    ...(ground ? { "--ground": `var(--color-family-${ground})` } : {}),
  } as CSSProperties;
  return (
    <section
      id={id}
      className="ps"
      data-ground={ground ? "" : undefined}
      data-plate={plate ? "" : undefined}
      // A wide product (a controller, a barrier arm) stands at the end, clear of the copy.
      data-wide={stage.image.w / stage.image.h > WIDE ? "" : undefined}
      aria-labelledby={`${id}-title`}
      style={style}
    >
      <div className="ps-stage in-stage">
        <div className="ps-hero">
          <div className="ps-word-in" aria-hidden="true">
            <p className="in-word ps-word" dir="ltr">
              {word}
            </p>
          </div>
          {productHref && (
            <p className="ps-shown in-mono">
              <Link href={productHref}>{fmt(s.shown, { model: stage.model })}</Link>
            </p>
          )}
          <div className="ps-copy">
            <Breadcrumbs items={crumbs} label={s.crumbs} tone="night" />
            {copy ?? (
              <>
                <h1 id={`${id}-title`}>{title}</h1>
                <p>{lead}</p>
                <div className="ps-actions">
                  {primary && (
                    <StagePill href={primary.href} data-jump="" prefetch={noPrefetch(primary.href)}>
                      {primary.label}
                    </StagePill>
                  )}
                  {secondary && (
                    <Link href={secondary.href} className="in-link" prefetch={noPrefetch(secondary.href)}>
                      {secondary.label}
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="ps-cue in-mono" aria-hidden="true">
            <span className="in-round">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </span>
            {s.cue}
          </p>
        </div>
        <div className="ps-rise">
          <div className="ps-device">
            <Image
              src={stage.image.src}
              alt={plate ? plate.alt : stage.model}
              width={stage.image.w}
              height={stage.image.h}
              sizes="(min-width: 1024px) 560px, 70vw"
              // The LCP element: the only preloaded image on the page (CLAUDE.md §3; Next 16 `preload`).
              preload
            />
            <span
              className="ps-screen"
              aria-hidden="true"
              style={
                {
                  "--sx": `${stage.screen.x * 100}%`,
                  "--sy": `${stage.screen.y * 100}%`,
                  "--sw": `${stage.screen.w * 100}%`,
                  "--sh": `${stage.screen.h * 100}%`,
                } as CSSProperties
              }
            />
          </div>
        </div>
        <div className="ps-inside">{children}</div>
      </div>
      <StageMotion sectionId={id} screen={stage.screen} />
    </section>
  );
}
