import { getDictionary } from "@/i18n/dictionaries";
import { ChevronDownIcon } from "@/components/icons";

/** T3 row 7: questions as native disclosures; answers stay in the DOM for search (Design Doc 9). */
export async function SolutionQuestions() {
  const { solutionTimeAttendance: c } = await getDictionary();
  return (
    <section className="t3-section t3-questions page-container" aria-labelledby="ta-faq-title">
      <h2 id="ta-faq-title" className="t3-title">
        {c.faq.heading}
      </h2>
      <div>
        {c.faq.items.map((item) => (
          <details key={item.q}>
            <summary>
              {item.q}
              <ChevronDownIcon />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
