import { Fragment, type CSSProperties } from "react";
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
 * T1 hero, video direction (client exploration, branch claude/video-home, 26 Nov 2026): a cinematic film plays behind
 * the copy, the headline reveals word by word, and a caption says what each shot stands for as it plays. Everything
 * is in place within a second over the poster, so nothing waits on the film.
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
            <Words text={h.line1} from={0} /> <Words text={h.line2} from={h.line1.split(" ").length} quiet />
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

/** One headline line, each word rising out of its own mask in turn (the index carries on across lines). */
function Words({ text, from, quiet = false }: { text: string; from: number; quiet?: boolean }) {
  return (
    <span className={quiet ? "vh-line vh-quiet" : "vh-line"}>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className="vh-word">
            <span className="vh-word-in" style={{ "--i": from + i } as CSSProperties}>
              {w}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </span>
  );
}
