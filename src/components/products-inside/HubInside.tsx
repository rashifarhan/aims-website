import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon, SearchIcon } from "@/components/icons";
import { productsInFamily } from "@/content/catalogue";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { parseFilters, serializeFilters } from "@/lib/filters";
import { QUICK_PICKS, applyPreset } from "@/lib/quickPicks";
import { FAMILY_ORDER, FAMILY_STAGES } from "./stages";

/**
 * Inside the kiosk's screen on /products: search, the popular shortcuts and the six families, each with its own
 * ground, AIMS's photograph of a real model and its count from the catalogue (CLAUDE.md, Truth). Picking a family
 * shows its products in the list below, in place (ListingJump); without JavaScript the links load that state.
 */
export async function HubInside({ total }: { total: number }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.productsStage;
  const hub = localePath(locale, "/products");
  const empty = parseFilters({});
  return (
    <div className="ps-glass ps-hub">
      <p className="ps-head in-mono">{fmt(s.rangeHead, { count: total })}</p>
      <div className="ps-hub-grid">
        <div className="ps-hub-copy">
          <p className="in-eyebrow">{s.hubEyebrow}</p>
          <h2 className="in-h2">{s.hubTitle}</h2>
          <form action={hub} method="get" role="search" className="ps-search" data-jump="">
            <label htmlFor="hub-search" className="sr-only">
              {s.searchLabel}
            </label>
            <SearchIcon className="ps-search-icon" aria-hidden="true" />
            <input
              id="hub-search"
              name="q"
              type="search"
              placeholder={t.catalogue.searchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit" aria-label={s.searchSubmit}>
              <ArrowIcon width="18" height="18" className="rtl:-scale-x-100" />
            </button>
          </form>
          <div className="ps-picks" role="group" aria-label={s.popular}>
            <span className="in-mono" aria-hidden="true">
              {s.popular}
            </span>
            {QUICK_PICKS.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`${hub}${serializeFilters(applyPreset(empty, p.preset))}#products`}
                data-jump=""
                prefetch={false}
              >
                {t.catalogue.picks[p.id]}
              </Link>
            ))}
          </div>
        </div>
        <ul className="ps-tiles">
          {FAMILY_ORDER.map((slug) => {
            const stage = FAMILY_STAGES[slug];
            const count = productsInFamily(slug).length;
            return (
              <li key={slug} style={{ "--ground": `var(--color-family-${slug})` } as CSSProperties}>
                <Link href={`${hub}?family=${slug}#products`} className="ps-tile" data-jump="" prefetch={false}>
                  <span className="ps-tile-word" aria-hidden="true" dir="ltr">
                    {t.home.inside.families[slug].word}
                  </span>
                  <Image src={stage.image.src} alt="" width={stage.image.w} height={stage.image.h} sizes="160px" />
                  <span className="ps-tile-foot">
                    <span>
                      <span className="ps-tile-name">{t.families[slug].name}</span>
                      <span className="ps-tile-count in-mono">{fmt(s.familyCount, { count })}</span>
                    </span>
                    <span className="ps-tile-arrow" aria-hidden="true">
                      <ArrowIcon width="16" height="16" className="rtl:-scale-x-100" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
