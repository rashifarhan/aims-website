import { getDictionary, getLocale } from "@/i18n/dictionaries";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { Faq } from "@/components/ui/Faq";
import { Section } from "@/components/ui/Section";

export async function SolutionFaq() {
  const t = await getDictionary();
  const faq = t.solutionsHub.faq;
  return (
    <Section labelledBy="solution-faq-title" className="solution-faq">
      <Faq
        items={faq.items}
        intro={
          <>
            <h2 id="solution-faq-title" className="section-title">
              {faq.title}
            </h2>
            <p className="section-lead">{faq.lead}</p>
            <Link href={localePath(await getLocale(), "/quote")} className="home-text-link mt-6">
              {faq.action}
            </Link>
          </>
        }
      />
    </Section>
  );
}
