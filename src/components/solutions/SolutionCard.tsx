import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { productBySlug } from "@/content/catalogue";
import type { SolutionCardData } from "@/content/solutions";
import { ArrowIcon } from "@/components/icons";

/**
 * Hub card (Design Doc 10.1 T2: "cards are real links with headings").
 * The visible "Explore … products" action is the link, stretched over the
 * card, so the whole card is clickable and the link's name is exactly its
 * visible text (WCAG 2.5.3); the heading stays a heading.
 */
export async function SolutionCard({ solution }: { solution: SolutionCardData }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const copy = t.solutionsHub.cards[solution.slug];
  const product = productBySlug(solution.product);
  const photo = product?.images[0];
  const titleId = `solution-${solution.slug}`;
  return (
    <article className="solution-card" aria-labelledby={titleId}>
      <div className="solution-card-heading">
        <div>
          <p className="solution-outcome">{copy.outcome}</p>
          <h2 id={titleId}>{t.solutions[solution.slug].name}</h2>
        </div>
        <div className="solution-card-art">
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
      <Link href={localePath(locale, `/products/${solution.family}`)} className="solution-card-action">
        {copy.action}
        <ArrowIcon className="rtl:-scale-x-100" />
      </Link>
    </article>
  );
}
