import { getDictionary } from "@/i18n/dictionaries";
import { LIVE_AIMS } from "@/lib/site";
import { ChevronDownIcon } from "@/components/icons";

export async function SolutionFaq() {
  const t = await getDictionary();
  const faq = t.solutionsHub.faq;
  return (
    <section className="solution-faq page-container" aria-labelledby="solution-faq-title">
      <div>
        <h2 id="solution-faq-title">{faq.title}</h2>
        <p className="solution-section-lead">{faq.lead}</p>
        <a href={LIVE_AIMS.contact} className="solution-advice">
          {faq.action}
          <span>{t.home.external}</span>
        </a>
      </div>
      <div>
        {faq.items.map((item) => (
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
