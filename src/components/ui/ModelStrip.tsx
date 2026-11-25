import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { productBySlug } from "@/content/catalogue";
import { pickStripItems } from "@/lib/modelStrip";
import { StripMarquee } from "./StripMarquee";
import "./model-strip.css";

/**
 * Premium pass, client decision 7: a band of real model codes that runs on its own as a slow ticker (the client's
 * choice of 25 Nov 2026, in place of moving with the scroll), each code linking to its product page. The second
 * list exists only to close the loop, so it is `inert` and `aria-hidden`: screen readers and the keyboard meet every
 * code once. The pause, off-screen and reduced-motion behaviour lives in StripMarquee and model-strip.css.
 */
export async function ModelStrip() {
  const t = await getDictionary();
  const locale = await getLocale();
  const items = pickStripItems(productBySlug);

  const list = (copy: boolean) => (
    <ul className="model-strip-list" {...(copy ? { "aria-hidden": true, inert: true } : {})}>
      {items.map((item) => (
        <li key={item.slug}>
          <Link href={localePath(locale, `/product/${item.slug}`)} className="model-strip-code" dir="ltr">
            {item.code}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="model-strip" aria-label={t.home.strip.label}>
      <StripMarquee pauseLabel={t.home.strip.pause}>
        <div className="model-strip-track" dir="ltr">
          {list(false)}
          {list(true)}
        </div>
      </StripMarquee>
    </section>
  );
}
