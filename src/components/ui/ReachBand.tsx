import type { ReactNode } from "react";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";

/**
 * The reach band, SIGNAL (Design Doc 8.3 "Locations / export"): night green, the shared heading and lead,
 * the page's working content (places, markets or steps) and the reach map. The section is the dealt moment:
 * MomentTrigger plays the map's routes once when it comes into view (signature/reach.css .reach-moment). On the
 * location pages (`trigger="map"`) the trigger sits on the map frame instead: at 35% of their one-screen band
 * only the map's top edge is on screen, so the draw would play unseen (audit E1). Under reduced motion the map
 * rests finished. On narrow screens the map follows the heading, so the moment is seen before the list
 * (ui/sections.css .ui-reach).
 */
export function ReachBand({
  id,
  titleId,
  heading,
  lead,
  map,
  trigger = "band",
  children,
}: {
  id?: string;
  titleId: string;
  heading: string;
  lead: string;
  /** The ReachMap, with the page's labels and destination. */
  map: ReactNode;
  /** Which element MomentTrigger watches: the whole band, or the map frame (the location pages). */
  trigger?: "band" | "map";
  children?: ReactNode;
}) {
  const onMap = trigger === "map";
  return (
    <Section
      ground="night"
      id={id}
      labelledBy={titleId}
      className={onMap ? "ui-reach" : "ui-reach reach-moment"}
      moment={!onMap}
    >
      <div className="ui-reach-grid">
        <div className="ui-reach-copy">
          <div className="ui-reach-head">
            <SectionHeader id={titleId} title={heading} lead={lead} />
          </div>
          {children && <div className="ui-reach-body">{children}</div>}
        </div>
        <div className={onMap ? "ui-reach-map reach-moment" : "ui-reach-map"} data-moment={onMap || undefined}>
          {map}
        </div>
      </div>
    </Section>
  );
}
