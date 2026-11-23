import { getDictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/ui/Faq";

/** T1 row 9: six answers. The closing band after it carries the page's last action. */
export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  return (
    <section id="faq" className="home-section home-faq wrap" aria-labelledby="faq-title">
      <Faq
        items={f.items}
        intro={
          <h2 id="faq-title" className="section-title">
            {f.heading}
          </h2>
        }
      />
    </section>
  );
}
