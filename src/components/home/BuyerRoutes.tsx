import Link from "next/link";
import type { ReactNode } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { LIVE_AIMS } from "@/lib/site";
import { ArrowIcon } from "@/components/icons";
import { ExternalLink } from "./ExternalLink";

/** Line icons on the 32px explainer grid (Design Doc 7). */
const ICONS = [
  <path key="box" d="m5 10 11-6 11 6v13l-11 6-11-6V10Zm0 0 11 6 11-6M16 16v13M10 7l11 6v5" />,
  <path key="site" d="M8 28V5h16v23M4 28h24M12 10h8M12 15h8M12 20h8M14 28v-4h4v4" />,
  <path
    key="globe"
    d="M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm0 0c-3 3-5 7.5-5 12s2 9 5 12m0-24c3 3 5 7.5 5 12s-2 9-5 12M4 16h24"
  />,
];

/** T1 section 2: one card per buyer route, each card one link (Design Doc 10, Plan 14). */
export async function BuyerRoutes() {
  const t = await getDictionary();
  const r = t.home.routes;
  const locale = await getLocale();
  const routes = [r.supply, r.install, r.export];
  const body = (route: (typeof routes)[number], i: number): ReactNode => (
    <>
      <div className="home-route-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
          {ICONS[i]}
        </svg>
      </div>
      <div className="home-route-text">
        <h3>{route.title}</h3>
        <p className="home-route-body">{route.body}</p>
        <p className="home-route-action">
          {route.action}
          {i === 0 && <ArrowIcon width="16" height="16" className="home-action-arrow" />}
        </p>
      </div>
    </>
  );
  return (
    <section className="home-section home-routes page-container" aria-labelledby="routes-title">
      <div className="home-section-heading">
        <div>
          <h2 id="routes-title" className="home-section-title">
            {r.heading}
          </h2>
          <p className="home-section-lead">{r.lead}</p>
        </div>
      </div>
      <ul className="home-route-grid">
        {routes.map((route, i) => (
          <li key={route.title}>
            {i === 0 ? (
              <Link href={localePath(locale, "/products")} className="home-route-card">
                {body(route, i)}
              </Link>
            ) : (
              <ExternalLink href={LIVE_AIMS.contact} label={t.common.externalSite} className="home-route-card">
                {body(route, i)}
              </ExternalLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
