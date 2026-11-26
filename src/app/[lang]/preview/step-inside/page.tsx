import type { Metadata } from "next";
import { getLocale } from "@/i18n/dictionaries";
import { StepInside } from "@/components/preview/StepInside";
import { PreviewHomeSections } from "@/components/preview/PreviewHomeSections";
import { previewSlides } from "@/components/preview/previewSlides";

export const metadata: Metadata = {
  title: "Home option: step inside",
  robots: { index: false, follow: false },
};

/** Exploration (branch claude/hero-options): the home page with hero option 2, step inside the terminal. */
export default async function StepInsidePreview() {
  const locale = await getLocale();
  return (
    <main id="main" className="home-bands">
      <StepInside slides={previewSlides(locale)} />
      <PreviewHomeSections />
    </main>
  );
}
