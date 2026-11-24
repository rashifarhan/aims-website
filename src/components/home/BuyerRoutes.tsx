import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";
import { Section } from "@/components/ui/Section";

/** Catalogue, then the quote list with the need preset (Design Doc 12, "Get an installation quote"). */
const HREFS = ["/products", "/quote?need=install", "/quote?need=export"] as const;

/**
 * T1 section 2: one link per buyer route (Design Doc 10, Plan 14). Impeccable bolder: an editorial split, the
 * heading on the start columns and the three routes as full-width rows set large, in place of a row of three
 * same-size cards (craft floor).
 */
export async function BuyerRoutes() {
  const t = await getDictionary();
  const r = t.home.routes;
  const locale = await getLocale();
  const routes = [r.supply, r.install, r.export];
  return (
    <Section labelledBy="routes-title" className="home-routes">
      <div className="home-routes-split">
        <h2 id="routes-title" className="section-title home-routes-title">
          {r.heading}
        </h2>
        <ul className="home-route-list">
          {routes.map((route, i) => (
            <li key={route.title}>
              <Link href={localePath(locale, HREFS[i])} className="home-route-row">
                <h3>{route.title}</h3>
                <p className="home-route-body">{route.body}</p>
                <p className="home-route-action">
                  <span>{route.action}</span>
                  <ArrowIcon width="16" height="16" className="home-action-arrow" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
