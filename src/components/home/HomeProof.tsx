import { Fragment } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import { COMPANY_FIGURES } from "@/lib/site";
import { CountUpFigure } from "./CountUpFigure";
import { HomeReviews } from "./HomeReviews";
import { Section } from "@/components/ui/Section";

const POINTS = ["showroom", "team", "places"] as const;

/**
 * T1 proof on night green, after the client's mockup B (24 Nov 2026): one sentence carrying AIMS's four figures with
 * the company-stated note under it, three reasons to buy from AIMS, then three published reviews as cards. The
 * authorization badge is not repeated here: the hero above (and the about hero) already carries it (card review,
 * 24 Nov 2026). `reviews={false}` leaves them to the reach globe that follows (/about). The sentence is the section's h2; its figures
 * count up once (CountUpFigure) and read as their final values everywhere else.
 */
export async function HomeProof({ reviews = true }: { reviews?: boolean } = {}) {
  const t = await getDictionary();
  const { proof } = t.home;
  return (
    <Section ground="night" labelledBy="proof-title" className="home-proof-band">
      <h2 id="proof-title" className="home-proof-statement" data-count-group>
        {COMPANY_FIGURES.map(({ key, value, suffix }, order) => (
          <Fragment key={key}>
            {order > 0 && " "}
            <b>
              <CountUpFigure value={value} suffix={suffix} order={order} />
            </b>{" "}
            {proof[key]}.
          </Fragment>
        ))}
      </h2>
      <p className="home-proof-note">{proof.body}</p>
      <ul className="home-proof-points">
        {POINTS.map((key) => (
          <li key={key}>
            <h3>{proof.points[key].title}</h3>
            <p>{proof.points[key].body}</p>
          </li>
        ))}
      </ul>
      {reviews && <HomeReviews />}
    </Section>
  );
}
