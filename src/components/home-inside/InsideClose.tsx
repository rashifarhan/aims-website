import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { CUTOUTS } from "@/components/inside/showcase";
import { StagePill } from "@/components/inside/StagePill";

/**
 * The closing stage (direction 2): AIMS's iFace 990 before the giant QUOTE, the ask, and two actions. The word is
 * decorative; the heading carries the ask.
 */
export async function InsideClose() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.home.closing;
  return (
    <section id="close" className="in-stage hc" aria-labelledby="closing-title">
      <p className="in-word hc-word" aria-hidden="true" dir="ltr">
        {t.home.inside.closeWord}
      </p>
      <div className="hc-device" data-reveal>
        <Image
          src={CUTOUTS.iface.src}
          alt=""
          width={CUTOUTS.iface.w}
          height={CUTOUTS.iface.h}
          sizes="(min-width: 1024px) 26rem, 70vw"
        />
      </div>
      <div className="hc-copy" data-reveal>
        <h2 id="closing-title" className="in-h2">
          {c.heading}
        </h2>
        <p className="in-lead">{c.body}</p>
        <div className="hc-actions">
          <StagePill href={localePath(locale, "/quote")}>{c.action}</StagePill>
          <Link href={localePath(locale, "/products")} className="in-link">
            {c.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
