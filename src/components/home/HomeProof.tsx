import { getDictionary } from "@/i18n/dictionaries";
import { productCount } from "@/content/catalogue";
import { FAMILIES } from "@/content/taxonomy";

export async function HomeProof() {
  const {
    home: { proof },
  } = await getDictionary();
  return (
    <section className="home-proof-band" aria-labelledby="proof-title">
      <div className="home-section home-proof">
        <div>
          <h2 id="proof-title" className="home-section-title">
            {proof.heading}
          </h2>
          <p className="home-section-lead">{proof.body}</p>
        </div>
        <dl>
          <div>
            <dt>{proof.catalogue}</dt>
            <dd className="tabular-nums">{productCount()}</dd>
          </div>
          <div>
            <dt>{proof.families}</dt>
            <dd className="tabular-nums">{FAMILIES.length}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
