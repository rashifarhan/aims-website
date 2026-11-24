import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { productBySlug } from "@/content/catalogue";
import { pickStripItems } from "@/lib/modelStrip";
import "./model-strip.css";

/**
 * Premium pass, client decision 7: a band of real model codes that slides sideways only as the page scrolls
 * (model-strip.css, `animation-timeline: view()`), never on a timer, so it needs no pause control. Each code links
 * to its product page. The second list exists only to fill the band while it slides, so it is `inert` and
 * `aria-hidden`: screen readers and the keyboard meet every code once. Without scroll-driven animation or under
 * reduced motion the band rests as one wrapped list.
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
      <div className="model-strip-track" dir="ltr">
        {list(false)}
        {list(true)}
      </div>
    </section>
  );
}
