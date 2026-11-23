import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { HeroAnimation } from "./HeroAnimation";
import { SignalLines } from "./SignalLines";

import { ArrowIcon } from "@/components/icons";
import { HeroTick } from "./HeroTick";

export async function Hero() {
  const t = await getDictionary();
  const h = t.home.hero;
  const locale = await getLocale();
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy wrap">
        <p className="home-eyebrow">
          <span aria-hidden="true" />
          {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
        </p>
        <h1 id="home-title" className="home-display">
          <span>
            <span className="home-headline-rise">{h.line1}</span>
          </span>
          {/* DESIGN.md One Sign Rule: green marks actions, so the second line steps back in ink. */}
          <span className="home-headline-quiet">
            <span className="home-headline-rise">{h.line2}</span>
          </span>
        </h1>
        <p className="home-lead">{h.lead}</p>
        <div className="home-hero-actions">
          <Link href={localePath(locale, "/products")} className="home-button">
            {h.explore}
            <ArrowIcon className="home-action-arrow rtl:-scale-x-100" />
          </Link>
          <Link href={localePath(locale, "/quote")} className="home-secondary">
            {h.quote}
          </Link>
        </div>
        <p className="home-trust">{h.trust}</p>
      </div>
      <HeroAnimation pauseLabel={h.pause}>
        <div className="home-wash" aria-hidden="true" />
        <div className="home-wash home-wash-verified" aria-hidden="true" />
        <SignalLines />
        <SignalLines mobile />
        <div className="home-device" role="img" aria-label={h.alt}>
          <Image
            src="/images/home/speedface-cut.png"
            alt=""
            width={362}
            height={776}
            sizes="(min-width: 1024px) 240px, 154px"
            preload
            className="home-device-photo"
          />
          <div className="home-device-screen" aria-hidden="true">
            <div className="home-device-bar">
              <span>{h.entrance}</span>
              <bdi>{h.time}</bdi>
            </div>
            <div data-screen="idle" className="home-screen-state home-idle">
              <bdi className="home-clock">{h.time}</bdi>
              <span className="home-day">{h.day}</span>
              <span className="home-screen-hint">{h.idle}</span>
            </div>
            <div data-screen="scan" className="home-screen-state home-scan">
              <svg viewBox="0 0 100 110" className="home-face">
                <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1.5 3.2">
                  <ellipse cx="50" cy="40" rx="20" ry="25" />
                  <path d="M14 108C16 82 32 72 50 72S84 82 86 108" />
                </g>
                <g fill="currentColor">
                  <circle cx="42" cy="38" r="1.6" />
                  <circle cx="58" cy="38" r="1.6" />
                  <circle cx="50" cy="47" r="1.3" />
                </g>
              </svg>
              <span className="home-scan-brackets">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span data-beam className="home-scan-beam" />
              <span className="home-screen-hint">{h.scanning}</span>
            </div>
            <div data-screen="verified" className="home-screen-state home-verified">
              <span className="home-device-tick">
                <HeroTick />
              </span>
              <strong>{h.welcome}</strong>
              <span className="home-checked">{h.checked}</span>
              <span className="home-unlocked">{h.unlocked}</span>
            </div>
          </div>
          <div data-granted className="home-granted" aria-hidden="true">
            <span>
              <HeroTick />
            </span>
            {h.granted}
          </div>
        </div>
      </HeroAnimation>
    </section>
  );
}
