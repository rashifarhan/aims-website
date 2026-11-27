import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { alternates } from "@/lib/seo";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { SolutionStage } from "@/components/solution/SolutionStage";
import { SmoothScroll } from "@/components/inside/SmoothScroll";
import { SolutionProducts } from "@/components/solution/SolutionProducts";
import { SolutionProcess } from "@/components/solution/SolutionProcess";
import { SolutionQuestions } from "@/components/solution/SolutionQuestions";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { DOOR_LOCKS_PAGE as PAGE } from "@/components/solution/door-locks/doorLocksPage";
import { LockUnlock } from "@/components/solution/door-locks/LockUnlock";
import { LockOptions } from "@/components/solution/door-locks/LockOptions";
import "@/components/solution/solution.css";
import "@/components/solution/door-locks/unlock.css";
import "@/components/inside/inside.css";
import "@/components/inside/skin.css";
import "@/components/products-inside/products-inside.css";

export async function generateMetadata(): Promise<Metadata> {
  const { solutionDoorLocks: t } = await getDictionary();
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(await getLocale(), `/solutions/${PAGE.slug}`),
  };
}

/**
 * T3 solution, door locks (Master Plan 12 #18, 14; Design Doc 8.2, 10), on the time attendance template.
 * Its one dealt moment is UNLOCK for a single smart lock. No software section: the lock software named in
 * the specs (ZKBiolock, ZSmart) is not in the software catalogue, so FAQ 3 and 5 name it instead.
 */
export default async function DoorLocksSolution() {
  const { solutionDoorLocks: c } = await getDictionary();
  const locale = await getLocale();
  return (
    <main id="main" className="d2 t3-page">
      <SolutionStage page={PAGE} copy={c} />
      <LockUnlock idPrefix="dl" />
      <LockOptions />
      <SolutionProducts idPrefix="dl" page={PAGE} copy={c.products} />
      <SolutionProcess idPrefix="dl" copy={c.process} />
      <SolutionQuestions ground="band" idPrefix="dl" copy={c.faq} />
      <ClosePanel
        id="dl-cta-title"
        heading={c.cta.heading}
        body={c.cta.body}
        action={{ href: localePath(locale, PAGE.quote), label: c.cta.action }}
        secondary={{ href: localePath(locale, `/products/${PAGE.family}`), label: c.cta.secondary }}
      />
      <MomentTrigger />
      <SmoothScroll />
    </main>
  );
}
