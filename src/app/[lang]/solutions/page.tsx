import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SOLUTION_CARDS } from "@/content/solutions";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionSite } from "@/components/solutions/SolutionSite";
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

/**
 * Design Doc 10.1 T2; Master Plan 12: five needs, industries and FAQs, on paper, band and mint grounds.
 * The one dealt moment is the site plan, "One site, five systems" (SolutionSite; Design Doc 8 SIGNAL), after the
 * cards: they answer "what", the plan "where on my site".
 * The hero is the compact one, with no photograph: the old split hero held a controller photo no card shows and a
 * full screen of blank space; now the five cards, which are the page, begin on the first screen.
 */
export default async function SolutionsHub() {
  const t = await getDictionary();
  const locale = await getLocale();
  const cta = t.solutionsHub.cta;
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
      <Section ground="band" className="solution-grid-section">
        <div className="solution-grid">
          {SOLUTION_CARDS.map((solution) => (
            <SolutionCard key={solution.slug} solution={solution} />
          ))}
        </div>
      </Section>
      {/* The dealt moment sits after the cards: they answer "what", the plan "where on my site". */}
      <SolutionSite />
      <SolutionIndustries />
      <SolutionFaq />
      <ClosePanel
        id="sh-cta-title"
        heading={cta.heading}
        body={cta.body}
        action={{ href: localePath(locale, "/quote?need=install"), label: cta.action }}
        secondary={{ href: localePath(locale, "/contact"), label: cta.secondary }}
      />
      <MomentTrigger />
    </main>
  );
}
