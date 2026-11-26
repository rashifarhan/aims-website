import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroTick } from "./HeroTick";
import { ReelVideo } from "./videohero/ReelVideo";
import "./videohero/video-hero.css";

/**
 * T1 hero, video direction (client exploration, branch claude/video-home, 26 Nov 2026): a full-bleed film of AIMS's
 * own hardware (video/src/HeroReel.tsx) plays behind the copy, and a caption names each shot as it plays. The copy
 * rises at once over the poster, so nothing waits on the film.
 */
export async function Hero() {
  const t = await getDictionary();
  const h = t.home.hero;
  const locale = await getLocale();
  return (
    <section className="vh section-night" aria-labelledby="home-title">
      <ReelVideo labels={h.reel} pause={h.pauseVideo} play={h.playVideo} label={h.videoLabel} />
      <div className="vh-scrim" aria-hidden="true" />
      <div className="vh-inner wrap">
        <div className="vh-copy">
          <p className="home-eyebrow vh-rise">
            <span aria-hidden="true">
              <HeroTick />
            </span>
            {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
          </p>
          <h1 id="home-title" className="home-display vh-title">
            <span className="vh-line">
              <span className="vh-rise">{h.line1}</span>
            </span>{" "}
            <span className="vh-line vh-quiet">
              <span className="vh-rise">{h.line2}</span>
            </span>
          </h1>
          <p className="home-lead vh-rise">{h.lead}</p>
          <div className="home-hero-actions vh-rise">
            <Magnetic>
              <Link href={localePath(locale, "/products")} className="home-button">
                {h.explore}
                <ArrowIcon className="home-action-arrow rtl:-scale-x-100" />
              </Link>
            </Magnetic>
            <Link href={localePath(locale, "/quote")} className="home-secondary">
              {h.quote}
            </Link>
          </div>
          <p className="home-trust vh-rise">
            <PinIcon width="16" height="16" />
            {h.trust}
          </p>
        </div>
      </div>
    </section>
  );
}
