import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { SolutionIntro } from "@/components/solution/SolutionIntro";
import { AttendanceStory } from "@/components/solution/AttendanceStory";
import { MethodGuide } from "@/components/solution/MethodGuide";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionSoftware } from "@/components/solution/SolutionSoftware";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { SolutionCta } from "@/components/solution/SolutionCta";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionTimeAttendance: t } = await getDictionary();
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(await getLocale(), "/solutions/time-attendance"),
  };
}

/** T3 solution, time attendance (Master Plan 12 #15, 14; Design Doc 8.3, 10). */
export default function TimeAttendanceSolution() {
  return (
    <main id="main">
      <SolutionIntro />
      <AttendanceStory />
      <MethodGuide />
      <SolutionProducts />
      <SolutionProcess />
      <SolutionSoftware />
      <SolutionQuestions />
      <SolutionCta />
    </main>
  );
}
