import { HeroTick } from "./HeroTick";

/** One corner bracket in a 100-unit box: the face-scan corner of a ZKTeco screen, grown to frame the photo. */
const CORNER = "M4 66V26Q4 4 26 4H66";

/**
 * The verified frame (client decision 4, 24 Nov 2026): four large corner brackets lock onto the real terminal photo
 * on load, one lime scan line sweeps down once, then the "Verified" tick lights, and everything stands still
 * (home.css; CLAUDE.md §3, the hero enters once). A border beam (ui/beam.css) runs round the frame twice and stops.
 * Decorative: the device's own role="img" names what the hero shows, so the frame is aria-hidden.
 */
export function HeroFrame({ verified, detail }: { verified: string; detail: string }) {
  return (
    <>
      <div className="home-frame" aria-hidden="true">
        <span className="home-frame-beam ui-beam" />
        {(["ss", "se", "es", "ee"] as const).map((corner) => (
          <span key={corner} className={`home-corner home-corner-${corner}`}>
            <svg viewBox="0 0 100 100">
              <path d={CORNER} vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        ))}
        <span className="home-frame-scan">
          <i />
        </span>
      </div>
      <p className="home-verified-chip" aria-hidden="true">
        <span className="home-verified-tick">
          <HeroTick />
        </span>
        <span>
          <b>{verified}</b>
          <span>{detail}</span>
        </span>
      </p>
    </>
  );
}
