import { Ridges } from "./Ridges";

/**
 * AIMS's signature on every inner hero (client decisions, 24 Nov 2026): the faint ridge motif behind the hero on its
 * media side, the green light above it coming from the hero's ground (ui/sections.css .page-hero). Static and
 * decorative: one small inline SVG reference, absolutely placed, so CLS stays 0.
 */
export function HeroSignature({ variant }: { variant: "split" | "compact" }) {
  return <Ridges className={`hero-ridges hero-ridges-${variant}`} />;
}
