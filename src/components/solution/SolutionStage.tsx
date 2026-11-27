import { FamilyInside } from "@/components/products-inside/FamilyInside";
import { PageStage } from "@/components/products-inside/PageStage";
import { SOLUTION_STAGES } from "@/components/products-inside/stages";
import { productsInFamily } from "@/content/catalogue";
import type { SolutionPageData } from "@/content/solutionPages";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import type { IntroCopy } from "./types";

/**
 * A solution page's first screen, direction 2 (CLAUDE.md → Design rules): its own product before the need's word,
 * the page's H1, promise and two actions (the quote with the need preset, the family's products with their count).
 * The dive opens the family's facts out of the product, every figure counted from the catalogue.
 */
export async function SolutionStage({ page, copy }: { page: SolutionPageData; copy: IntroCopy }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const stage = SOLUTION_STAGES[page.slug];
  return (
    <PageStage
      id={`${page.slug}-stage`}
      stage={stage}
      word={t.home.inside.families[page.family].word}
      crumbs={[
        { href: href("/"), label: t.common.home },
        { href: href("/solutions"), label: t.nav.solutions },
        { href: href(`/solutions/${page.slug}`), label: t.solutions[page.slug].name },
      ]}
      title={copy.title}
      lead={copy.lead}
      primary={{ href: href(page.quote), label: copy.primary }}
      secondary={{
        href: href(`/products/${page.family}`),
        label: fmt(copy.secondary, { count: productsInFamily(page.family).length }),
      }}
      productHref={href(`/product/${stage.productSlug}`)}
      ground={page.family}
    >
      <FamilyInside family={page.family} stage={stage} />
    </PageStage>
  );
}
