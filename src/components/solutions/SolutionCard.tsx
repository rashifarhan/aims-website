import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { countLabel } from "@/i18n/format";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import type { SolutionCardData } from "@/content/solutions";
import { ArrowIcon } from "@/components/icons";
import { navigationHref } from "@/lib/navigationHref";

export async function SolutionCard({ solution }: { solution: SolutionCardData }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const copy = t.solutionsHub.cards[solution.slug];
  const product = productBySlug(solution.product);
  const photo = product?.images[0];
  const count = productsInFamily(solution.family).length;
  const titleId = `solution-${solution.slug}`;
  return (
    // The heading holds the link and its ::after covers the card, so the name is the title,
    // not every line of the card (WCAG 2.5.3; Design Doc T2 "cards are real links with headings").
    // The shared card (actions.css): 2px lift and 1.03 photo zoom, like every linked card on the site.
    <article className="solution-card ui-card ui-card-interactive spotlight-card">
      <div className="solution-card-heading">
        <div>
          <p className="solution-outcome">{copy.outcome}</p>
          <h2 id={titleId}>
            <Link
              href={navigationHref(localePath(locale, `/solutions/${solution.slug}`))}
              className="solution-card-link"
            >
              {t.solutions[solution.slug].name}
            </Link>
          </h2>
          {/* Micro facts from the catalogue: the pictured model and how many products the family holds. */}
          <p className="solution-card-meta">
            {product && (
              <span className="solution-model">
                <span className="sr-only">{t.solutionsHub.pictured} </span>
                <bdi dir="ltr">{product.model}</bdi>
              </span>
            )}
            <span className="tabular-nums">
              {countLabel(count, t.solutionsHub.productCountOne, t.solutionsHub.productCount)}
            </span>
          </p>
        </div>
        <div className="solution-card-art ui-card-photo">
          {photo && (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 160px, 112px"
            />
          )}
        </div>
      </div>
      <p className="solution-card-description">{copy.description}</p>
      <div className="solution-components">
        <p>{t.solutionsHub.components}</p>
        <ul>
          {copy.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <span className="solution-card-action" aria-hidden="true">
        {copy.action}
        <ArrowIcon className="rtl:-scale-x-100" />
      </span>
    </article>
  );
}
