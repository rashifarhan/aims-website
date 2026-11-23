import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { productBySlug } from "@/content/catalogue";
import { SOLUTION_CARDS } from "@/content/solutions";
import { SolutionDoor } from "@/components/solution/access-control/SolutionDoor";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { SolutionIndustries } from "@/components/solutions/SolutionIndustries";
import { SolutionFaq } from "@/components/solutions/SolutionFaq";
import "@/components/solution/access-control/door.css";
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
 * The one dealt moment is UNLOCK, the approved door kit, reused from the access control page (Design Doc 8.2).
 * The hero photograph is a controller no card below shows, so no picture repeats on the screen.
 */
export default async function SolutionsHub() {
  const t = await getDictionary();
  const locale = await getLocale();
  const cta = t.solutionsHub.cta;
  return (
    <main id="main">
      <PageHero
        variant="split"
        crumbs={[
          { href: localePath(locale, "/"), label: t.common.home },
          { href: localePath(locale, "/solutions"), label: t.nav.solutions },
        ]}
        title={t.solutionsHub.title}
        lead={t.solutionsHub.lead}
        photo={productBySlug("inbio-pro-160")?.images[0]}
      />
      {/* Each card's h2 names its need; the grid itself needs no heading. */}
      <Section ground="band" className="solution-grid-section" screens={2}>
        <div className="solution-grid">
          {SOLUTION_CARDS.map((solution) => (
            <SolutionCard key={solution.slug} solution={solution} />
          ))}
        </div>
      </Section>
      <SolutionDoor idPrefix="sh" ground="paper" />
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
