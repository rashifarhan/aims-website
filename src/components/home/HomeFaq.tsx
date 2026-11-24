import { getDictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/ui/Faq";
import { Section } from "@/components/ui/Section";

/** T1 row 9: six answers, on the faint band (client decision, 24 Nov 2026). The closing band after it carries the
 * page's last action. */
export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  return (
    <Section ground="band" id="faq" labelledBy="faq-title" className="home-faq">
      <Faq
        items={f.items}
        intro={
          <h2 id="faq-title" className="section-title">
            {f.heading}
          </h2>
        }
      />
    </Section>
  );
}
