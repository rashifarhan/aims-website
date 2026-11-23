import { getDictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/ui/Faq";
import { Section } from "@/components/ui/Section";

/** T1 row 9: six answers. The closing band after it carries the page's last action. */
export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  return (
    <Section id="faq" labelledBy="faq-title" className="home-faq">
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
