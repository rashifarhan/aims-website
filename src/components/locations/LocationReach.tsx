import type { ReactNode } from "react";
import { ReachMap } from "@/components/home/ReachMap";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * The page's one dealt moment, SIGNAL (Design Doc 8.3 "Locations / export"): on night green, the routes draw
 * once from AIMS's Dubai showroom when the band comes into view (MomentTrigger + signature/reach.css), and a
 * T7 page's market lights up on arrival. Under reduced motion the map rests finished. The left column holds
 * the band's working content: destinations on the hub, the steps on a location page.
 */
export async function LocationReach({
  id,
  heading,
  lead,
  destination,
  mapLabel,
  children,
}: {
  id: string;
  heading: string;
  lead: string;
  destination?: "oman" | "kenya";
  mapLabel?: string;
  children: ReactNode;
}) {
  const { home } = await getDictionary();
  return (
    <section id={id} className="loc-reach reach-moment" data-moment aria-labelledby={`${id}-title`}>
      <div className="loc-reach-grid wrap">
        <div>
          <h2 id={`${id}-title`} className="t3-title">
            {heading}
          </h2>
          <p className="loc-reach-lead">{lead}</p>
          {children}
        </div>
        <div className="loc-reach-map">
          <ReachMap labels={{ ...home.reach, mapLabel: mapLabel ?? home.reach.mapLabel }} destination={destination} />
        </div>
      </div>
    </section>
  );
}
