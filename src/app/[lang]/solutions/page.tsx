import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
    <main id="main" className="solutions-hub">
      <div className="solution-intro page-container">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: localePath(locale, "/"), label: t.common.home },
            { href: localePath(locale, "/solutions"), label: t.nav.solutions },
          ]}
        />
        <h1>{t.solutionsHub.title}</h1>
        <p className="solution-lead">{t.solutionsHub.lead}</p>
      </div>
      <div className="solution-grid page-container">
        {SOLUTION_CARDS.map((solution) => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
      </div>
      <SolutionIndustries />
      <SolutionFaq />
    </main>
  );
}
