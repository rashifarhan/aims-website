import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { StagePill } from "@/components/inside/StagePill";
import { CUTOUTS } from "@/components/inside/showcase";
import { DiveShowcase } from "./DiveShowcase";
import { DiveMotion } from "./DiveMotion";
import "./home-dive.css";

/**
 * The home stage and dive (direction 2, CLAUDE.md → Design rules; after MotionSites "Laptop Portfolio"). AIMS's
 * SpeedFace stands before the giant AIMS with an access card on a lanyard. The section pins with CSS sticky and native
 * scroll; DiveMotion, the one client leaf, flies the terminal forward until its screen fills the stage and opens the
 * six families out of it, one per stretch of scroll. The server renders every family in order, so without JavaScript
 * or under reduced motion the hero stands and the families follow it as a list (home-dive.css).
 */
export async function HomeDive() {
  const t = await getDictionary();
  const locale = await getLocale();
  const h = t.home.hero;
  const i = t.home.inside;
  return (
    <section id="home-dive" className="dv" aria-labelledby="home-title">
      <div className="dv-stage in-stage">
        <div className="dv-hero">
          <div className="dv-word-in" aria-hidden="true">
            <p className="in-word dv-word" dir="ltr">
              {i.word}
            </p>
          </div>
          {ZKTECO_AUTHORIZATION_CONFIRMED && <p className="dv-claim">{i.claim}</p>}
          <div className="dv-badge" aria-hidden="true">
            <svg className="dv-lanyard" viewBox="0 0 120 330" fill="none">
              <path d="M30 0C40 140 52 230 62 300M92 0C84 140 72 230 62 300" />
              <rect x="50" y="292" width="24" height="30" rx="6" />
            </svg>
            <div className="dv-card">
              <Image src={CUTOUTS.card.src} alt="" width={CUTOUTS.card.w} height={CUTOUTS.card.h} sizes="224px" />
              <p dir="ltr">
                AIMS<i>.</i>
                <small>{i.card}</small>
              </p>
            </div>
          </div>
          <div className="dv-copy">
            <h1 id="home-title">
              <span>{h.line1}</span> <span>{h.line2}</span>
            </h1>
            <p>{h.lead}</p>
            <div className="dv-actions">
              <StagePill href={localePath(locale, "/products")}>{h.explore}</StagePill>
              <Link href={localePath(locale, "/quote")} className="in-link">
                {h.quote}
              </Link>
            </div>
          </div>
          <p className="dv-cue in-mono" aria-hidden="true">
            <span className="in-round">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </span>
            {i.cue}
          </p>
        </div>

        <div className="dv-rise">
          <div className="dv-device" data-dive-device>
            <Image
              src={CUTOUTS.speedface.src}
              alt={i.deviceAlt}
              width={CUTOUTS.speedface.w}
              height={CUTOUTS.speedface.h}
              sizes="(min-width: 1024px) 360px, 240px"
              priority
            />
            <div className="dv-screen" aria-hidden="true">
              <svg viewBox="0 0 100 120" fill="none" strokeLinecap="round">
                <path className="dv-brackets" d="M14 30V14h16M70 14h16v16M86 90v16H70M30 106H14V90" />
                <ellipse className="dv-face" cx="50" cy="56" rx="20" ry="26" />
                <path className="dv-scan" d="M18 30h64" />
                <path className="dv-tick" d="M38 100l8 8 16-16" />
              </svg>
            </div>
          </div>
        </div>

        <DiveShowcase />
      </div>
      <DiveMotion sectionId="home-dive" />
    </section>
  );
}
