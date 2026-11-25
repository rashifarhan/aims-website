import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { SOLUTION_PAGES } from "@/content/solutionPages";
import { SolutionIntro } from "@/components/solution/SolutionIntro";
import { SolutionDoor } from "@/components/solution/access-control/SolutionDoor";
import { SolutionMethods } from "@/components/solution/SolutionMethods";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionSoftware } from "@/components/solution/SolutionSoftware";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { ClosePanel } from "@/components/ui/ClosePanel";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";
import "@/components/solution/access-control/door.css";

const PAGE = SOLUTION_PAGES["access-control"];

export async function generateMetadata(): Promise<Metadata> {
  const { solutionAccessControl: t } = await getDictionary();
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(await getLocale(), `/solutions/${PAGE.slug}`),
  };
}

/**
 * T3 solution, access control (Master Plan 12 #16, 14; Design Doc 8.2, 10), on the time attendance
 * template. Its one dealt moment is UNLOCK, the approved door kit, in a section of its own.
 */
export default async function AccessControlSolution() {
  const { solutionAccessControl: c } = await getDictionary();
  const locale = await getLocale();
  const software = PAGE.software.map(({ slug, kind, purpose }) => ({
    slug,
    kind: c.software[kind],
    purpose: c.software[purpose],
  }));
  return (
    <main id="main" className="t3-page">
      <SolutionIntro page={PAGE} copy={c} />
      <SolutionDoor idPrefix="ac" />
      <SolutionMethods idPrefix="ac" page={PAGE} copy={c.methods} />
      <SolutionProducts idPrefix="ac" page={PAGE} copy={c.products} />
      <SolutionProcess idPrefix="ac" copy={c.process} />
      <SolutionSoftware idPrefix="ac" copy={c.software} items={software} />
      <SolutionQuestions idPrefix="ac" copy={c.faq} />
      <ClosePanel
        id="ac-cta-title"
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: localePath(locale, PAGE.quote), label: c.cta.action }}
        secondary={{ href: localePath(locale, `/products/${PAGE.family}`), label: c.cta.secondary }}
      />
    </main>
  );
}
