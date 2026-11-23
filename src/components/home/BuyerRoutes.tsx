import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";
import { Section } from "@/components/ui/Section";

/** Catalogue, then the quote list with the need preset (Design Doc 12, "Get an installation quote"). */
const HREFS = ["/products", "/quote?need=install", "/quote?need=export"] as const;

/**
 * T1 section 2: one card per buyer route, each card one link (Design Doc 10, Plan 14). The card is
 * "barely there" (taste skill cards.md): no icon tile stacked over the title, text at body size.
 */
export async function BuyerRoutes() {
  const t = await getDictionary();
  const r = t.home.routes;
  const locale = await getLocale();
  const routes = [r.supply, r.install, r.export];
  return (
    <Section labelledBy="routes-title" className="home-routes">
      <h2 id="routes-title" className="section-title home-routes-title">
        {r.heading}
      </h2>
      <ul className="home-route-grid">
        {routes.map((route, i) => (
          <li key={route.title}>
            <Link href={localePath(locale, HREFS[i])} className="home-route-card ui-card ui-card-interactive">
              <h3>{route.title}</h3>
              <p className="home-route-body">{route.body}</p>
              <p className="home-route-action">
                {route.action}
                <ArrowIcon width="16" height="16" className="home-action-arrow" />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
