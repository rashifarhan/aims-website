import { getDictionary } from "@/i18n/dictionaries";
import { COMPANY_FIGURES } from "@/lib/site";
import { Section } from "@/components/ui/Section";
import { CountUpFigure } from "./CountUpFigure";
import { HomeReviews } from "./HomeReviews";

/**
 * The home proof, premium pass (client decision 6, 24 Nov 2026): AIMS's four company-stated figures in the display
 * face on a quiet band, with the company-stated note under them (Design Doc 3.1). The figures count up once
 * (CountUpFigure, the page's one count). AIMS's published reviews follow on the same light band, as the home preview of
 * About (client decision, 25 Nov 2026). The about page keeps the fuller night proof (HomeProof).
 */
export async function HomeFigures() {
  const t = await getDictionary();
  const proof = t.home.proof;
  return (
    <Section ground="band" labelledBy="proof-title" className="home-figures">
      <h2 id="proof-title" className="sr-only">
        {proof.label}
      </h2>
      <ul className="home-figure-list" data-count-group>
        {COMPANY_FIGURES.map(({ key, value, suffix }, order) => (
          <li key={key}>
            <span className="home-figure">
              <CountUpFigure value={value} suffix={suffix} order={order} />
            </span>
            <span className="home-figure-label">{proof[key]}</span>
          </li>
        ))}
      </ul>
      <p className="home-figures-note">{proof.body}</p>
      <HomeReviews />
    </Section>
  );
}
