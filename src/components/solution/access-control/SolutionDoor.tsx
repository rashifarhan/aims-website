import { getDictionary } from "@/i18n/dictionaries";
import { DoorIllustration } from "@/components/home/DoorIllustration";
import { DoorMotion } from "./DoorMotion";
import { DoorParts } from "./DoorParts";

/**
 * UNLOCK (Design Doc 8.2), the page's one dealt moment: the approved door kit, walked through by a GSAP sequence
 * (DoorMotion) that the server render's finished frame stands in for until it loads, under reduced motion and without
 * JS. The drawing comes before the parts list so a phone sees it first; from 1024px the two stand side by side.
 */
export async function SolutionDoor({ idPrefix }: { idPrefix: string }) {
  const t = await getDictionary();
  const c = t.solutionAccessControl.door;
  return (
    <section className="section section-band t3-door" aria-labelledby={`${idPrefix}-door-title`}>
      <div className="wrap">
        <div className="t3-door-head">
          <h2 id={`${idPrefix}-door-title`} className="section-title">
            {c.heading}
          </h2>
          <p className="section-lead">{c.lead}</p>
        </div>
        <div className="home-door-stage">
          <DoorIllustration labels={t.home.door} />
        </div>
        <DoorParts />
        <DoorMotion />
      </div>
    </section>
  );
}
