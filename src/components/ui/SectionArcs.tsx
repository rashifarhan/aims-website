import { SignalArt } from "./SignalArt";

/* The prototype's fan, its lines leaving past the top end corner, so the arcs open from the corner where a section
   heading leaves room and fade before the content below (signal-art.css .section-arcs). */
const ARCS = { width: 1440, height: 600, target: { x: 1500, y: -80 }, count: 14 };

/**
 * A faint, still texture of AIMS signal arcs behind a home section (client decision, 24 Nov 2026: the product
 * families band and the journey), the same curves as the hero signature. Decorative, aria-hidden, no motion.
 */
export function SectionArcs({ id }: { id: string }) {
  return <SignalArt field={ARCS} gradientId={`${id}-arcs`} className="section-arcs" />;
}
