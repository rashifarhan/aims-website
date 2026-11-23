import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { marketHref } from "@/lib/locationPages";
import { DELIVERY_MARKETS } from "@/lib/site";

/**
 * T2 hub "set destination" (Design Doc 10.1): the markets AIMS lists, grouped as it groups them. Oman and Kenya
 * open their pages; every other market opens the quote with that destination filled in.
 */
export async function LocationMarkets() {
  const { locations } = await getDictionary();
  const locale = await getLocale();
  const t = locations.hub;
  return (
    <div className="loc-markets">
      {(Object.keys(DELIVERY_MARKETS) as (keyof typeof DELIVERY_MARKETS)[]).map((group) => (
        <div key={group}>
          {/* A label for its list, not a heading: two bare region names in the heading list said nothing (audit I2). */}
          <p id={`loc-markets-${group}`} className="loc-markets-group">
            {t.groups[group]}
          </p>
          <ul aria-labelledby={`loc-markets-${group}`}>
            {DELIVERY_MARKETS[group].map((country) => {
              const href = marketHref(country);
              return (
                <li key={country}>
                  <Link href={localePath(locale, href)} className="loc-market">
                    {t.countries[country]}
                    <span className="sr-only">, {href.startsWith("/quote") ? t.marketQuote : t.marketPage}</span>
                    <ArrowIcon
                      width="16"
                      height="16"
                      aria-hidden="true"
                      className="home-action-arrow rtl:-scale-x-100"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
