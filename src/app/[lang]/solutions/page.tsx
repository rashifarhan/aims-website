import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SOLUTION_CARDS } from "@/content/solutions";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionIndustries } from "@/components/solutions/SolutionIndustries";
import { SolutionFaq } from "@/components/solutions/SolutionFaq";
import "@/components/solutions/solutions.css";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionsHub } = await getDictionary();
  return {
    title: solutionsHub.metaTitle,
    description: solutionsHub.metaDescription,
    alternates: alternates(await getLocale(), "/solutions"),
  };
}

/** Design Doc 10.1 T2; Master Plan 12: five needs, industries and FAQs. */
export default async function SolutionsHub() {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <main id="main">
      <PageHero
        variant="compact"
        crumbs={[
          { href: localePath(locale, "/"), label: t.common.home },
          { href: localePath(locale, "/solutions"), label: t.nav.solutions },
        ]}
        title={t.solutionsHub.title}
        lead={t.solutionsHub.lead}
      />
      {/* Each card's h2 names its need; the grid itself needs no heading. */}
      <Section className="solution-grid">
        {SOLUTION_CARDS.map((solution) => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
      </Section>
      <SolutionIndustries />
      <SolutionFaq />
    </main>
  );
}
