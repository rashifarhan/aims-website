import { getDictionary } from "@/i18n/dictionaries";
import { ChevronDownIcon } from "@/components/icons";

/** T1 row 9: six answers. The closing band after it carries the page's last action. */
export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  return (
    <section id="faq" className="home-section home-faq page-container" aria-labelledby="faq-title">
      <div className="home-faq-intro">
        <h2 id="faq-title" className="home-section-title">
          {f.heading}
        </h2>
      </div>
      <div>
        {f.items.map((item) => (
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
