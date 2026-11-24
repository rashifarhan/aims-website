import { SignalArt } from "./SignalArt";

/* One half of the closing band in viewBox units: the phone fan's lines rise from the whole bottom edge and meet at
   the band's top centre (this half's start corner). The start half is the same drawing mirrored. */
const HALF = { width: 720, height: 480, target: { x: 0, y: 0 }, count: 12, mobile: true };

/**
 * AIMS's signature behind the closing band on every page (client request, 24 Nov 2026): two fans of the signal lines
 * rise from the bottom corners and meet above the heading, as every signal in the hero meets at the terminal.
 * Still, decorative and aria-hidden; CSS places, fades and mirrors it (signal-art.css .close-signal).
 */
export function CloseSignal({ id }: { id: string }) {
  return (
    <div className="close-signal" aria-hidden="true">
      <SignalArt field={HALF} gradientId={`${id}-signal-start`} className="close-signal-half close-signal-start" />
      <SignalArt field={HALF} gradientId={`${id}-signal-end`} className="close-signal-half close-signal-end" />
    </div>
  );
}
