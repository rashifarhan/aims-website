import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ZKTECO_AUTHORIZATION_CONFIRMED } from "@/lib/site";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { Ridges } from "@/components/ui/Ridges";
import { Hero3DStage } from "./hero3d/Hero3DStage";
import { HeroTick } from "./HeroTick";

/**
 * T1 hero: the copy beside the 3D loop of a site AIMS equips (hero3d/, client choice 25 Nov 2026) over the ridge motif.
 * The headline holds two lines from 1024px, the second the quieter ink-600 line.
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
        {/* The 3D hero (client choice, 25 Nov 2026), on its own branch for review. */}
        <div className="home-stage home-stage-3d">
          <Ridges className="home-hero-ridges" />
          <Hero3DStage label={h.scene} pauseLabel={h.pause} playLabel={h.play} />
        </div>
      </div>
    </section>
  );
}
