import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { LIVE_AIMS } from "@/lib/site";
import { ArrowIcon, ChevronDownIcon } from "@/components/icons";
import { ExternalLink } from "./ExternalLink";

/** T1 row 9: six answers, then the page's closing "Request a quote" (Design Doc 10). */
export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  return (
    <section id="faq" className="home-section home-faq page-container" aria-labelledby="faq-title">
      <div className="home-faq-intro">
        <h2 id="faq-title" className="home-section-title">
          {f.heading}
        </h2>
        <p className="home-section-lead">{f.lead}</p>
        <div className="home-faq-cta">
          <h3>{f.ctaHeading}</h3>
          <p>{f.ctaBody}</p>
          <ExternalLink href={LIVE_AIMS.contact} label={t.common.externalSite} className="home-button">
            {t.home.hero.quote}
          </ExternalLink>
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
