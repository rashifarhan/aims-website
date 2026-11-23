import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";

/** Closing band on night green; two still glows in its ground light it (a tech CSS ground; nothing moves). */
export async function HomeClosing() {
  const { home } = await getDictionary();
  const c = home.closing;
  const locale = await getLocale();
  return (
    <section className="home-night home-closing" aria-labelledby="closing-title">
      <div className="home-closing-inner wrap">
        <h2 id="closing-title" className="home-closing-title">
          {c.heading}
        </h2>
        <p className="home-night-lead">{c.body}</p>
        <div className="home-closing-actions">
          <Link href={localePath(locale, "/quote")} className="home-button home-button-lime">
            {c.action}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
          <Link href={localePath(locale, "/products")} className="home-night-link">
            {c.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
