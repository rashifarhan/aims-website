import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import { SOLUTION_CARDS } from "@/content/solutions";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionSite } from "@/components/solutions/SolutionSite";
import { SolutionIndustries } from "@/components/solutions/SolutionIndustries";
import { SolutionFaq } from "@/components/solutions/SolutionFaq";
import "@/components/motion/entrance.css";
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
      {/* The shared AIMS entrance (motion/entrance.css), as on every T3 hero. No photo, so no studio light. */}
      <div className="solution-intro aims-hero page-container">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: localePath(locale, "/"), label: t.common.home },
            { href: localePath(locale, "/solutions"), label: t.nav.solutions },
          ]}
        />
        <h1 className="aims-headline-mask">
          <span className="aims-headline">{t.solutionsHub.title}</span>
        </h1>
        <p className="solution-lead">{t.solutionsHub.lead}</p>
      </div>
      <div className="solution-grid page-container">
        {SOLUTION_CARDS.map((solution) => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
      </div>
      {/* The dealt moment sits after the cards: they answer "what", the plan "where on my site". */}
      <SolutionSite />
      <SolutionIndustries />
      <SolutionFaq />
      <MomentTrigger />
    </main>
  );
}
