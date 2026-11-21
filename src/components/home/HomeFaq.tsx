import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon, ChevronDownIcon } from "@/components/icons";

/** T1 row 9: six answers, then the page's closing "Request a quote" (Design Doc 10). */
export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  const locale = await getLocale();
  return (
    <section id="faq" className="home-section home-faq page-container" aria-labelledby="faq-title">
      <div className="home-faq-intro">
        <h2 id="faq-title" className="home-section-title">
          {f.heading}
        </h2>
        <div className="home-faq-cta">
          <h3>{f.ctaHeading}</h3>
          <p>{f.ctaBody}</p>
          <Link href={localePath(locale, "/quote")} className="home-button">
            {t.home.hero.quote}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
          <Link href="#showrooms" className="home-text-link home-text-link-row">
            {f.visit}
            <ArrowIcon width="16" height="16" className="home-action-arrow" />
          </Link>
        </div>
      </div>
      <div>
        {f.items.map((item) => (
          <details key={item.q}>
            <summary>
              {item.q}
              <ChevronDownIcon />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
