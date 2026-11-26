import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { HomeFigures } from "@/components/home/HomeFigures";
import { ProductFamilies } from "@/components/home/ProductFamilies";
import { HomeWhereItGoes } from "@/components/home/HomeWhereItGoes";
import { HomeSoftware } from "@/components/home/HomeSoftware";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeVisit } from "@/components/home/HomeVisit";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { ModelStrip } from "@/components/ui/ModelStrip";
import "@/components/home/home.css";
import "@/components/home/sections.css";
import "@/components/home/premium.css";
import "@/components/signature/reach.css";

/** The real home sections, under an exploration hero, so each option can be judged as a whole page. */
export async function PreviewHomeSections() {
  const t = await getDictionary();
  const locale = await getLocale();
  const close = t.home.closing;
  return (
    <>
      <HomeFigures />
      <ModelStrip />
      <ProductFamilies />
      <HomeWhereItGoes />
      <HomeSoftware />
      <HomeJourney />
      <HomeVisit />
      <ClosePanel
        id="closing-title"
        heading={close.heading}
        body={close.body}
        action={{ href: localePath(locale, "/quote"), label: close.action }}
        secondary={{ href: localePath(locale, "/products"), label: close.secondary }}
      />
    </>
  );
}
