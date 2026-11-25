import { HeroTick } from "./HeroTick";

/** One corner bracket in a 100-unit box: the face-scan corner of a ZKTeco screen, grown to frame the photo. */
const CORNER = "M4 66V26Q4 4 26 4H66";

/**
 * The verified frame (client decision 4, 24 Nov 2026): four large corner brackets around the real terminal photo, a
 * scan line, a border beam and the "Verified · Face · Entrance A" chip. The server renders the final, verified frame
 * (no JS and reduced motion show it); HeroTimeline's GSAP timeline closes the brackets in, sweeps the scan, springs
 * the chip and runs the beam twice, then everything stands (README Decisions, "Hero choreography with GSAP").
 *
 * Each corner is mirrored by its own CSS scale, so the inner element (scroll exit) and the svg (entrance) move along
 * (-x, -y) in their mirrored space, which is always outward, in English and in Arabic. The chip's anchor carries its
 * place and the scroll fade; the chip itself springs in. Decorative: the device's own role="img" names what the hero
 * shows, so the frame is aria-hidden.
 */
export function HeroFrame({ verified, detail }: { verified: string; detail: string }) {
  return (
    <>
      <div className="home-frame" aria-hidden="true">
        <span className="home-frame-beam" />
        {(["ss", "se", "es", "ee"] as const).map((corner) => (
          <span key={corner} className={`home-corner home-corner-${corner}`}>
            <i>
              <svg viewBox="0 0 100 100">
                <path d={CORNER} vectorEffect="non-scaling-stroke" />
              </svg>
            </i>
          </span>
        ))}
        <span className="home-frame-scan">
          <i />
        </span>
      </div>
      <div className="home-verified-anchor" aria-hidden="true">
        <p className="home-verified-chip">
          <span className="home-verified-tick">
            <HeroTick />
          </span>
          <span>
            <b>{verified}</b>
            <span>{detail}</span>
          </span>
        </p>
      </div>
    </>
  );
}
