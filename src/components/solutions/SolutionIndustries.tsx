import { getDictionary } from "@/i18n/dictionaries";

export async function SolutionIndustries() {
  const { industries } = (await getDictionary()).solutionsHub;
  return (
    <section className="solution-industries" aria-labelledby="industries-title">
      <div className="page-container">
        <h2 id="industries-title">{industries.title}</h2>
        <p className="solution-section-lead">{industries.lead}</p>
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
