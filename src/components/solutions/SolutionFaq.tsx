import { getDictionary, getLocale } from "@/i18n/dictionaries";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { ChevronDownIcon } from "@/components/icons";

export async function SolutionFaq() {
  const t = await getDictionary();
  const faq = t.solutionsHub.faq;
  return (
    <section className="solution-faq page-container" aria-labelledby="solution-faq-title">
      <div>
        <h2 id="solution-faq-title">{faq.title}</h2>
        <p className="solution-section-lead">{faq.lead}</p>
        <Link href={localePath(await getLocale(), "/quote")} className="solution-advice">
          {faq.action}
        </Link>
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
