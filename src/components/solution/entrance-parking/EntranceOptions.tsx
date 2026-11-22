import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { ArrowIcon } from "@/components/icons";
import { ModelChip } from "@/components/product/ModelChip";
import { englishData } from "@/components/product/englishData";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import { typesFor } from "@/content/taxonomy";
import { EP_OPTIONS, EP_PAGE, EP_TYPES } from "./data";

/**
 * T3 row 3, "Choose the lane" (Plan 14). The shared SolutionOptions makes the whole card one link with
 * a count; here a card names two example models instead (links inside a link would be invalid), and
 * the only counts are the listing's own type filters, labelled with the filter's name: "Turnstiles &
 * gates" also holds metal detectors, an X-ray system and a plate camera, so it is never "N turnstiles".
 */
export async function EntranceOptions({ idPrefix }: { idPrefix: string }) {
  const t = await getDictionary();
  const c = t.solutionEntranceParking.options;
  const locale = await getLocale();
  const family = productsInFamily(EP_PAGE.family);
  return (
    <section className="t3-section page-container" aria-labelledby={`${idPrefix}-methods-title`}>
      <div className="t3-heading">
        <h2 id={`${idPrefix}-methods-title`} className="t3-title">
          {c.heading}
        </h2>
        <p className="t3-lead">{c.lead}</p>
      </div>
      <ul className="ep-options">
        {EP_OPTIONS.map((option) => (
          <li key={option.key} className="ui-card ep-option">
            <span className="method-icon" aria-hidden="true">
              <svg
                viewBox="0 0 32 32"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={option.icon} />
              </svg>
            </span>
            <h3>{c.items[option.key].title}</h3>
            <p>{c.items[option.key].body}</p>
            <ul className="ep-chips" aria-label={c.examples}>
              {option.examples
                .filter(({ slug }) => productBySlug(slug))
                .map(({ slug, code }) => (
                  <li key={slug}>
                    <Link href={localePath(locale, `/product/${slug}`)} className="ep-chip" {...englishData(locale)}>
                      <ModelChip model={code} />
                    </Link>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="ep-option-links">
        {EP_TYPES.map((type) => (
          <Link
            key={type}
            href={localePath(locale, `/products/${EP_PAGE.family}?type=${type}`)}
            className="home-text-link"
          >
            <span className="tabular-nums">
              {fmt(c.allIn, {
                count: family.filter((p) => typesFor(p.sourceCategories).includes(type)).length,
                type: t.catalogue.types[type],
              })}
            </span>
            <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
