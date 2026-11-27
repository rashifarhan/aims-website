import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { solutionPath } from "@/lib/nav";
import { ArrowIcon } from "@/components/icons";
import { FloodHead } from "@/components/families/FloodHead";
import { FloodSection } from "@/components/families/FloodSection";

/**
 * "From the front gate to the last door" on the entrance ground (Solutions menu). A place is shown by the AIMS
 * product that goes there, cut out (Design rules → Imagery: no stock photographs), in the order a visitor meets
 * them, each linking to the solution page that fits it.
 */
const PLACES = [
  { key: "carPark", img: "zkteco-barrier-gates-bgm-1060", w: 818, h: 292, size: 100, solution: "entrance-parking" },
  {
    key: "office",
    img: "zkteco-mars-b1200-double-swing-barrier-gate",
    w: 500,
    h: 588,
    size: 74,
    solution: "entrance-parking",
  },
  { key: "entrance", img: "kr600", w: 376, h: 575, size: 40, solution: "access-control" },
  { key: "hotel", img: "zkteco-lh6500-door-lock", w: 411, h: 719, size: 38, solution: "door-locks" },
] as const;

export async function HomePlaces() {
  const t = await getDictionary();
  const locale = await getLocale();
  const g = t.home.gate;
  return (
    <FloodSection id="places" tone="entry" labelledBy="places-title">
      <FloodHead
        id="places-title"
        kicker={t.nav.solutions}
        title={g.heading}
        lead={g.lead}
        link={{ href: localePath(locale, "/solutions"), label: g.all }}
      />
      <ol className="hp-grid">
        {PLACES.map((p, i) => {
          const copy = g[p.key];
          return (
            <li key={p.key}>
              <Link href={localePath(locale, solutionPath(p.solution))} className="hp-place">
                <span className="hp-step">
                  <span dir="ltr">{String(i + 1).padStart(2, "0")}</span> · {copy.step}
                </span>
                <span className="hp-art" style={{ "--w": `${p.size}%` } as CSSProperties}>
                  <Image
                    src={`/images/cutouts/${p.img}.png`}
                    alt=""
                    width={p.w}
                    height={p.h}
                    sizes="(min-width: 1024px) 20vw, 70vw"
                  />
                </span>
                <span className="hp-foot">
                  <span>
                    <span className="hp-title">{copy.title}</span>
                    <span className="hp-text">{copy.text}</span>
                  </span>
                  <span className="flood-go" aria-hidden="true">
                    <ArrowIcon width="18" height="18" className="rtl:-scale-x-100" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </FloodSection>
  );
}
