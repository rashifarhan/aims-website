import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { SolutionIntro } from "@/components/solution/SolutionIntro";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { POS_PAGE as PAGE } from "@/components/solution/pos/posPage";
import { CounterVerify } from "@/components/solution/pos/CounterVerify";
import { PosOptions } from "@/components/solution/pos/PosOptions";
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
  const locale = await getLocale();
  return (
    <main id="main" className="t3-page pc-page">
      <SolutionIntro page={PAGE} copy={c} />
      <CounterVerify idPrefix="ps" />
      <PosOptions />
      <SolutionProducts idPrefix="ps" page={PAGE} copy={c.products} />
      <SolutionProcess idPrefix="ps" copy={c.process} />
      <SolutionQuestions ground="band"
        idPrefix="ps"
        copy={c.faq}
        close={
          <ClosePanel
            embedded
            id="ps-cta-title"
            heading={c.cta.heading}
            body={c.cta.body}
            action={{ href: localePath(locale, PAGE.quote), label: c.cta.action }}
            secondary={{ href: localePath(locale, `/products/${PAGE.family}`), label: c.cta.secondary }}
          />
        }
      />
      <MomentTrigger />
    </main>
  );
}
