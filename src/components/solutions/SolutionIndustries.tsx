import { getDictionary } from "@/i18n/dictionaries";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

export async function SolutionIndustries() {
  const { industries } = (await getDictionary()).solutionsHub;
  return (
    <Section ground="band" labelledBy="industries-title" className="solution-industries">
      <SectionHeader id="industries-title" title={industries.title} lead={industries.lead} />
      <ul>
        {industries.items.map((item) => (
          <li key={item.name}>
            <h3>{item.name}</h3>
            <p>{item.needs}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
