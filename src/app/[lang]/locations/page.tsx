import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial/EditorialPage";
import { ExternalLink } from "@/components/home/ExternalLink";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { alternates } from "@/lib/seo";
import { LIVE_AIMS } from "@/lib/site";
import "@/components/editorial/editorial.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locations: c } = await getDictionary();
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: alternates(await getLocale(), "/locations"),
  };
}

/** AIMS's published market pages; they open there until the T7 location pages are built (Plan 12 #32–35). */
const LIVE_PAGES: Record<string, string> = {
  dubai: "/zkteco-distributor-in-dubai",
  oman: "/zkteco-distributor-in-oman",
  kenya: "/zkteco-distributors-in-kenya",
};

/**
 * T2 hub, Locations (Master Plan 12 #6): four markets as real links. Abu Dhabi has no page of its
 * own, so its card goes to the showrooms on the homepage; the others open AIMS's current pages (↗).
 */
export default async function Locations() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.locations;
  const showrooms = `${localePath(locale, "/")}#showrooms`;
  return (
    <EditorialPage
      crumbs={[
        { href: localePath(locale, "/"), label: t.common.home },
        { href: localePath(locale, "/locations"), label: t.nav.locations },
      ]}
      title={c.title}
      lead={c.lead}
    >
      <ul className="ed-cards">
        {c.cards.map((card) => {
          const body = (
            <>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <span className="ed-owner">{fmt(c.open, { name: card.title })}</span>
            </>
          );
          const live = LIVE_PAGES[card.key];
          return (
            <li key={card.key} className="ed-card-item">
              {live ? (
                <ExternalLink
                  href={`${LIVE_AIMS.home.slice(0, -1)}${live}`}
                  label={t.common.externalSite}
                  className="ed-card"
                >
                  {body}
                </ExternalLink>
              ) : (
                <Link href={showrooms} className="ed-card">
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <div className="ed-actions">
        <Link href={showrooms} className="home-secondary">
          {c.visit}
        </Link>
      </div>
    </EditorialPage>
  );
}
