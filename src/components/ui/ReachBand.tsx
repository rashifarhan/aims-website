import type { ReactNode } from "react";
import { ReachMotion } from "@/components/home/ReachMotion";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";

/**
 * The reach band, SIGNAL (Design Doc 8.3 "Locations / export"): night green, the shared heading and lead,
 * the page's working content (places, markets or steps) and the reach map. The map is the dealt moment: ReachMotion
 * plays its GSAP sequence once when a third of the map itself is on screen (home/ReachTimeline), so the draw is never
 * spent on the band's top edge (audit E1). Under reduced motion and without JS the map rests finished. On narrow
 * screens the map follows the heading, so the moment is seen before the list
 * (ui/sections.css .ui-reach). `link` is the header's end link (the home page's "See locations"). `ground="band"`
 * sets it on the light band with the light map (signature/reach.css .ui-reach-light): the home page, where the
 * client kept night green to the software band and the close (25 Nov 2026).
 */
export function ReachBand({
  id,
  titleId,
  heading,
  lead,
  link,
  map,
  ground = "night",
  children,
}: {
  id?: string;
  titleId: string;
  heading: string;
  lead: string;
  link?: ReactNode;
  /** The ReachMap, with the page's labels and destination. */
  map: ReactNode;
  /** Night green (default), or the light band with the light map. */
  ground?: "night" | "band";
  children?: ReactNode;
}) {
  const tone = ground === "band" ? " ui-reach-light" : "";
  return (
    <Section ground={ground} id={id} labelledBy={titleId} className={"ui-reach" + tone}>
      <div className="ui-reach-grid">
        <div className="ui-reach-copy">
          <div className="ui-reach-head">
            <SectionHeader id={titleId} title={heading} lead={lead} link={link} />
          </div>
          {children && <div className="ui-reach-body">{children}</div>}
        </div>
        <div className="ui-reach-map">
          {map}
          <ReachMotion />
        </div>
      </div>
    </Section>
  );
}
