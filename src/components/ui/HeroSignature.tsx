import { SignalArt } from "./SignalArt";

/*
 * The fields in viewBox units. Wide (desktop): the prototype's fan, its lines meeting behind the photograph's column
 * on a split hero, or leaving past the top end corner on a compact one, so they stay on the media side, away from the copy.
 * Narrow (phones and portrait tablets, split only): the phone fan, meeting behind the photograph under the actions.
 */
const WIDE = { width: 1440, height: 760, count: 18 };
const TARGET = { split: { x: 1100, y: 400 }, compact: { x: 1480, y: -40 } };
const NARROW = { width: 390, height: 390, target: { x: 195, y: 205 }, count: 10, mobile: true };

/**
 * AIMS's signature on every inner hero (client decision, 24 Nov 2026): faint signal lines behind the hero, the
 * green light above them coming from the hero's ground (ui/sections.css .page-hero). Static, decorative and light:
 * two inline SVGs, no image, no layout box (absolutely placed), so CLS stays 0.
 */
export function HeroSignature({ variant }: { variant: "split" | "compact" }) {
  return (
    <>
      <SignalArt
        field={{ ...WIDE, target: TARGET[variant] }}
        gradientId={`hero-signal-${variant}`}
        className={`hero-signal hero-signal-wide hero-signal-${variant}`}
      />
      {variant === "split" && (
        <SignalArt field={NARROW} gradientId="hero-signal-narrow" className="hero-signal hero-signal-narrow" />
      )}
    </>
  );
}
