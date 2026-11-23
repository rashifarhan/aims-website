import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

/**
 * The reach band, SIGNAL (Design Doc 8.3 "Locations / export"): night green, the shared heading and lead,
 * the page's working content (places, markets or steps) and the reach map. The section is the dealt moment:
 * MomentTrigger plays the map's routes once when it comes into view (signature/reach.css .reach-moment);
 * under reduced motion the map rests finished. On narrow screens the map follows the heading, so the moment
 * is seen before the list (ui/sections.css .ui-reach).
 */
export function ReachBand({
  id,
  titleId,
  heading,
  lead,
  map,
  children,
}: {
  id?: string;
  titleId: string;
  heading: string;
  lead: string;
  /** The ReachMap, with the page's labels and destination. */
  map: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="ui-reach reach-moment" data-moment aria-labelledby={titleId}>
      <div className="ui-reach-grid wrap">
        <div className="ui-reach-copy">
          <div className="ui-reach-head">
            <SectionHeader id={titleId} title={heading} lead={lead} />
          </div>
          {children && <div className="ui-reach-body">{children}</div>}
        </div>
        <div className="ui-reach-map">{map}</div>
      </div>
    </section>
  );
}
