import { getDictionary, getLocale } from "@/i18n/dictionaries";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { Faq } from "@/components/ui/Faq";

export async function SolutionFaq() {
  const t = await getDictionary();
  const faq = t.solutionsHub.faq;
  return (
    <section className="solution-faq wrap" aria-labelledby="solution-faq-title">
      <Faq
        items={faq.items}
        intro={
          <>
            <h2 id="solution-faq-title" className="section-title">
              {faq.title}
            </h2>
            <p className="section-lead">{faq.lead}</p>
            <Link href={localePath(await getLocale(), "/quote")} className="solution-advice">
              {faq.action}
            </Link>
          </>
        }
      />
    </section>
  );
}
