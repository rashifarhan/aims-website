import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { FamilySlider } from "@/components/families/FamilySlider";
import { familySlides } from "@/components/families/familySlides";

/** The home hero: the six family floods, access control first (CLAUDE.md → Design rules; client, 27 Nov 2026). */
export async function HomeStage() {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.home.stage;
  return (
    <FamilySlider
      slides={familySlides(t, locale)}
      labels={{
        label: s.label,
        titleLead: s.titleLead,
        titleRest: s.titleRest,
        titleAccent: s.titleAccent,
        tabs: s.tabs,
        shown: s.shown,
        range: s.range,
        previous: s.previous,
        next: s.next,
      }}
    />
  );
}
