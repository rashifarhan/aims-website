import { getDictionary } from "@/i18n/dictionaries";
import { LIVE_AIMS } from "@/lib/site";
import { ChevronDownIcon } from "@/components/icons";

export async function HomeFaq() {
  const t = await getDictionary();
  const f = t.home.faq;
  return (
    <section id="faq" className="home-section home-faq page-container" aria-labelledby="faq-title">
      <div>
        <h2 id="faq-title" className="home-section-title">
          {f.heading}
        </h2>
        <p className="home-section-lead">{f.lead}</p>
        <a href={LIVE_AIMS.contact} className="home-text-link">
          {t.home.hero.quote}
          <span className="home-external-label">{t.home.external}</span>
        </a>
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
