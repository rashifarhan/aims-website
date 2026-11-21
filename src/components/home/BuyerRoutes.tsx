import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";

/** Catalogue, then the quote list with the need preset (Design Doc 12, "Get an installation quote"). */
const HREFS = ["/products", "/quote?need=install", "/quote?need=export"] as const;

/** T1 section 2 as three ruled rows, like lines on a site sheet: no icon tiles, no equal cards. */
export async function BuyerRoutes() {
  const t = await getDictionary();
  const r = t.home.routes;
  const locale = await getLocale();
  const routes = [r.supply, r.install, r.export];
  return (
    <section className="home-section home-routes page-container" aria-labelledby="routes-title">
      <h2 id="routes-title" className="home-section-title">
        {r.heading}
      </h2>
      <ul className="home-route-list">
        {routes.map((route, i) => (
          <li key={route.title}>
            <Link href={localePath(locale, HREFS[i])} className="home-route-row">
              <span className="home-route-index tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{route.title}</h3>
              <p>{route.body}</p>
              <span className="home-route-action">
                {route.action}
                <ArrowIcon width="16" height="16" className="home-action-arrow" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
