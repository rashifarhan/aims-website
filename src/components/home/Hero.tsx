import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { Ridges } from "@/components/ui/Ridges";
import { HeroAnimation } from "./HeroAnimation";
import { HeroFrame } from "./HeroFrame";
import { HeroModel } from "./HeroModel";
import { HeroScreen } from "./HeroScreen";
import { HeroTick } from "./HeroTick";

/**
 * T1 hero, premium pass (client decisions 2 and 4, 24 Nov 2026): the copy beside the real SpeedFace terminal, which
 * the verified frame locks onto on load (HeroFrame) over the ridge motif. The headline holds two lines from 1024px,
 * the second the quieter ink-600 line. The device screen keeps the approved verification loop (HeroAnimation).
 */
export async function Hero() {
  const t = await getDictionary();
  const h = t.home.hero;
  const locale = await getLocale();
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-inner wrap">
        <div className="home-hero-copy">
          <p className="home-eyebrow">
            <span aria-hidden="true">
              <HeroTick />
            </span>
            {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
          </p>
          <h1 id="home-title" className="home-display">
            <span>
              <span className="home-headline-rise">{h.line1}</span>
            </span>{" "}
            {/* DESIGN.md One Sign Rule: green marks actions, so the second line steps back in ink. */}
            <span className="home-headline-quiet">
              <span className="home-headline-rise">{h.line2}</span>
            </span>
          </h1>
          <p className="home-lead">{h.lead}</p>
          <div className="home-hero-actions">
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
          <p className="home-trust">
            <PinIcon width="16" height="16" />
            {h.trust}
          </p>
        </div>
        <div className="home-stage">
          <Ridges className="home-hero-ridges" />
          <HeroAnimation pauseLabel={h.pause}>
            <div className="home-wash" aria-hidden="true" />
            <div className="home-wash home-wash-verified" aria-hidden="true" />
            <div className="home-device" role="img" aria-label={h.alt}>
              <Image
                src="/images/home/speedface-cut.png"
                alt=""
                width={362}
                height={776}
                sizes="(min-width: 1024px) 270px, 180px"
                preload
                className="home-device-photo"
              />
              <HeroScreen labels={h} />
            </div>
          </HeroAnimation>
          <HeroFrame verified={h.verified} detail={`${h.method} · ${h.entrance}`} />
          <HeroModel />
        </div>
      </div>
    </section>
  );
}
