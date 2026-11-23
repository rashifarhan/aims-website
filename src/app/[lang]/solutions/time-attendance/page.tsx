import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { SOLUTION_PAGES } from "@/content/solutionPages";
import { SolutionIntro } from "@/components/solution/SolutionIntro";
import { AttendanceStory } from "@/components/solution/AttendanceStory";
import { SolutionMethods } from "@/components/solution/SolutionMethods";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionSoftware } from "@/components/solution/SolutionSoftware";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { ClosePanel } from "@/components/ui/ClosePanel";
import "@/components/solution/solution.css";

const PAGE = SOLUTION_PAGES["time-attendance"];

export async function generateMetadata(): Promise<Metadata> {
  const { solutionTimeAttendance: t } = await getDictionary();
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(await getLocale(), `/solutions/${PAGE.slug}`),
  };
}

/** T3 solution, time attendance: the template page (Master Plan 12 #15, 14; Design Doc 8.3, 10). */
export default async function TimeAttendanceSolution() {
  const { solutionTimeAttendance: c } = await getDictionary();
  const locale = await getLocale();
  const software = PAGE.software.map(({ slug, kind, purpose }) => ({
    slug,
    kind: c.software[kind],
    purpose: c.software[purpose],
  }));
  return (
    <main id="main">
      <SolutionIntro page={PAGE} copy={c} />
      <AttendanceStory />
      <SolutionMethods idPrefix="ta" page={PAGE} copy={c.methods} />
      <SolutionProducts idPrefix="ta" page={PAGE} copy={c.products} />
      <SolutionProcess idPrefix="ta" copy={c.process} />
      <SolutionSoftware idPrefix="ta" copy={c.software} items={software} />
      <SolutionQuestions idPrefix="ta" copy={c.faq} />
      <ClosePanel
        id="ta-cta-title"
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: localePath(locale, PAGE.quote), label: c.cta.action }}
        secondary={{ href: localePath(locale, `/products/${PAGE.family}`), label: c.cta.secondary }}
      />
    </main>
  );
}
