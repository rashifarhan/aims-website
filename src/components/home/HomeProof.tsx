import { getDictionary } from "@/i18n/dictionaries";
import { productCount, softwareList } from "@/content/catalogue";
import { FAMILIES } from "@/content/taxonomy";
import { LOCATION_LINES } from "@/lib/site";

/**
 * T1 row 5: one quiet proof bar. Every figure is counted from imported data, never a
 * company claim, until AIMS confirms its years, installations and clients (Design Doc 3.1).
 */
export async function HomeProof() {
  const {
    home: { proof },
  } = await getDictionary();
  const facts = [
    [productCount(), proof.catalogue],
    [FAMILIES.length, proof.families],
    [softwareList().length, proof.software],
    [LOCATION_LINES.length, proof.locations],
  ] as const;
  return (
    <section className="home-proof-band" aria-labelledby="proof-title">
      <div className="home-section home-proof page-container">
        <div>
          <h2 id="proof-title" className="home-section-title">
            {proof.heading}
          </h2>
          <p className="home-section-lead">{proof.body}</p>
        </div>
        <dl>
          {facts.map(([value, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
