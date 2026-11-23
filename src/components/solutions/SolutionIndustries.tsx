import { getDictionary } from "@/i18n/dictionaries";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function SolutionIndustries() {
  const { industries } = (await getDictionary()).solutionsHub;
  return (
    <section className="solution-industries" aria-labelledby="industries-title">
      <div className="wrap">
        <SectionHeader id="industries-title" title={industries.title} lead={industries.lead} />
        <ul>
          {industries.items.map((item) => (
            <li key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.needs}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
