import { getDictionary } from "@/i18n/dictionaries";
import { softwareBySlug } from "@/content/catalogue";
import { LIVE_AIMS } from "@/lib/site";

export async function HomeSoftware() {
  const t = await getDictionary();
  const s = t.home.software;
  const entries = [
    ["biotime-9-5", s.attendance],
    ["biotimecloud", s.cloud],
    ["zkaccess-3-5", s.access],
  ];
  return (
    <section className="home-section page-container" aria-labelledby="software-title">
      <div className="home-section-heading">
        <div>
          <h2 id="software-title" className="home-section-title">
            {s.heading}
          </h2>
          <p className="home-section-lead">{s.lead}</p>
        </div>
        <a href={LIVE_AIMS.software} className="home-text-link">
          {s.centre}
          <span className="home-external-label">{t.home.external}</span>
        </a>
      </div>
      <div className="home-three-grid">
        {entries.map(([slug, label]) => {
          const software = softwareBySlug(slug);
          if (!software) return null;
          return (
            <article className="home-software-card" key={slug}>
              <p className="text-small text-green-700">{label}</p>
              <h3 dir="ltr" className="font-mono">
                {software.name}
              </h3>
              <p>{s.request}</p>
              <a href={software.sourceUrl} className="home-text-link">
                {s.details}
                <span className="home-external-label">{t.home.external}</span>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
