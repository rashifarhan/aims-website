import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { LIVE_AIMS } from "@/lib/site";

export async function BuyerRoutes() {
  const t = await getDictionary();
  const r = t.home.routes;
  const locale = await getLocale();
  return (
    <section className="home-section home-routes" aria-labelledby="routes-title">
      <h2 id="routes-title" className="home-section-title">
        {r.heading}
      </h2>
      <div className="home-three-grid">
        {[r.supply, r.install, r.export].map((route, i) => (
          <article key={route.title} className="home-route-card">
            <svg
              viewBox="0 0 32 32"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              className="text-green-700"
            >
              {i === 0 ? (
                <>
                  <path d="m5 10 11-6 11 6v13l-11 6-11-6V10Zm0 0 11 6 11-6M16 16v13M10 7l11 6v5" />
                </>
              ) : i === 1 ? (
                <>
                  <path d="M8 28V5h16v23M4 28h24M12 10h8M12 15h8M12 20h8" />
                  <path d="M14 28v-4h4v4" />
                </>
              ) : (
                <>
                  <circle cx="16" cy="16" r="12" />
                  <ellipse cx="16" cy="16" rx="5" ry="12" />
                  <path d="M4 16h24M7 9h18M7 23h18" />
                </>
              )}
            </svg>
            <h3>{route.title}</h3>
            <p>{route.body}</p>
            {i === 0 ? (
              <Link href={localePath(locale, "/products")} className="home-text-link">
                {route.action}
              </Link>
            ) : (
              <a href={LIVE_AIMS.contact} className="home-text-link">
                {route.action}
                <span className="home-external-label">{t.home.external}</span>
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
