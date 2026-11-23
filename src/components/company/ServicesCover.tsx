import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";

/**
 * Master Plan 12 #5 "coverage; warranty": where AIMS supplies and installs (as it publishes on the
 * homepage and /contact), and ZKTeco's warranty, linked rather than restated (CLAUDE.md §1).
 */
export async function ServicesCover() {
  const { services } = await getDictionary();
  const locale = await getLocale();
  const c = services.cover;
  const cards = [
    { title: c.areaTitle, body: c.areaBody, href: localePath(locale, "/contact"), action: c.areaAction },
    {
      title: c.warrantyTitle,
      body: c.warrantyBody,
      href: `${localePath(locale, "/support")}#warranty`,
      action: c.warrantyAction,
    },
  ];
  return (
    <section className="t3-section wrap" aria-labelledby="services-cover-title">
      <h2 id="services-cover-title" className="section-title">
        {c.heading}
      </h2>
      <ul className="co-cover">
        {cards.map((card) => (
          <li key={card.title} className="ui-card ui-card-interactive co-cover-card">
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <Link href={card.href} className="home-text-link co-cover-link">
              {card.action}
              <ArrowIcon width="16" height="16" className="home-action-arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
