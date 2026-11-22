import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import { SolutionIntro } from "@/components/solution/SolutionIntro";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { SolutionCta } from "@/components/solution/SolutionCta";
import { POS_PAGE as PAGE } from "@/components/solution/pos/posPage";
import { CounterVerify } from "@/components/solution/pos/CounterVerify";
import { PosOptions } from "@/components/solution/pos/PosOptions";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";
import "@/components/solution/pos/counter.css";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionPos: t } = await getDictionary();
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(await getLocale(), `/solutions/${PAGE.slug}`),
  };
}

/**
 * T3 solution, POS (Master Plan 12 #19, 14; Design Doc 8.2, 10), on the time attendance template. Its one
 * dealt moment is VERIFY at the counter. No software section: the software catalogue holds no POS
 * software, so the page says to choose by the software the counter already runs.
 */
export default async function PosSolution() {
  const { solutionPos: c } = await getDictionary();
  return (
    <main id="main" className="pc-page">
      <SolutionIntro page={PAGE} copy={c} />
      <CounterVerify idPrefix="ps" />
      <PosOptions />
      <SolutionProducts idPrefix="ps" page={PAGE} copy={c.products} />
      <SolutionProcess idPrefix="ps" copy={c.process} />
      <SolutionQuestions idPrefix="ps" copy={c.faq} />
      <SolutionCta idPrefix="ps" page={PAGE} copy={c.cta} />
      <MomentTrigger />
    </main>
  );
}
