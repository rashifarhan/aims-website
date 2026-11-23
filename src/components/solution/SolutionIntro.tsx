import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { PageHero } from "@/components/ui/PageHero";
import { productBySlug, productsInFamily } from "@/content/catalogue";
import type { SolutionPageData } from "@/content/solutionPages";
import type { IntroCopy } from "./types";

/**
 * T3 row 1: the shared split hero (ui/PageHero) fed from the page's data, so a new solution page never
 * builds its own crumbs or count: title, promise and two actions beside AIMS's own product photograph
 * (Master Plan 14; taste photos.md "the product leads").
 */
export async function SolutionIntro({ page, copy }: { page: SolutionPageData; copy: IntroCopy }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  return (
    <PageHero
      variant="split"
      crumbs={[
        { href: href("/"), label: t.common.home },
        { href: href("/solutions"), label: t.nav.solutions },
        { href: href(`/solutions/${page.slug}`), label: t.solutions[page.slug].name },
      ]}
      eyebrow={copy.eyebrow}
      title={copy.title}
      lead={copy.lead}
      primary={{ href: href(page.quote), label: copy.primary }}
      secondary={{
        href: href(`/products/${page.family}`),
        label: fmt(copy.secondary, { count: productsInFamily(page.family).length }),
      }}
      photo={productBySlug(page.hero)?.images[0]}
    />
  );
}
