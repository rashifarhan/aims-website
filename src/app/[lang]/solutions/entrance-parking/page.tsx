import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { SolutionIntro } from "@/components/solution/SolutionIntro";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionSoftware } from "@/components/solution/SolutionSoftware";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { EP_PAGE as PAGE } from "@/components/solution/entrance-parking/data";
import { EntranceLanes } from "@/components/solution/entrance-parking/EntranceLanes";
import { EntranceOptions } from "@/components/solution/entrance-parking/EntranceOptions";
import "@/components/solution/solution.css";
import "@/components/solution/entrance-parking/entrance-parking.css";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionEntranceParking: t } = await getDictionary();
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(await getLocale(), `/solutions/${PAGE.slug}`),
  };
}

/**
 * T3 solution, entrance and parking (Master Plan 12 #17, 14; Design Doc 8, 10), on the time attendance
 * template. Its one dealt moment is SIGNAL at a lane, in a section of its own (eight sections: one is
 * enough, taste motion.md). Counts come from the entrance-control family.
 */
export default async function EntranceParkingSolution() {
  const { solutionEntranceParking: c } = await getDictionary();
  const locale = await getLocale();
  const software = PAGE.software.map(({ slug, kind, purpose }) => ({
    slug,
    kind: c.software[kind],
    purpose: c.software[purpose],
  }));
  return (
    <main id="main">
      <SolutionIntro page={PAGE} copy={c} />
      <EntranceLanes idPrefix="ep" />
      <EntranceOptions idPrefix="ep" />
      <SolutionProducts idPrefix="ep" page={PAGE} copy={c.products} />
      <SolutionProcess idPrefix="ep" copy={c.process} />
      <SolutionSoftware idPrefix="ep" copy={c.software} items={software} />
      <SolutionQuestions idPrefix="ep" copy={c.faq} />
      <ClosePanel
        id="ep-cta-title"
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: localePath(locale, PAGE.quote), label: c.cta.action }}
        secondary={{ href: localePath(locale, `/products/${PAGE.family}`), label: c.cta.secondary }}
      />
      <MomentTrigger />
    </main>
  );
}
