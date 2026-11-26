import type { Metadata } from "next";
import { getLocale } from "@/i18n/dictionaries";
import { FamilySlider } from "@/components/preview/FamilySlider";
import { PreviewHomeSections } from "@/components/preview/PreviewHomeSections";
import { previewSlides } from "@/components/preview/previewSlides";

export const metadata: Metadata = {
  title: "Home option: product families",
  robots: { index: false, follow: false },
};

/** Exploration (branch claude/hero-options): the home page with hero option 3, the product family slider. */
export default async function FamiliesPreview() {
  const locale = await getLocale();
  return (
    <main id="main" className="home-bands">
      <FamilySlider slides={previewSlides(locale)} />
      <PreviewHomeSections />
    </main>
  );
}
