import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

type Labels = Dictionary["home"]["reach"];

const ARABIA =
  "M111.9 45L170 20L338.8 40L366.9 45L395 80L423.1 95L507.5 78L515 93L578.8 115L526.2 151L432.5 175L301.2 212L263.8 210L258.1 180L188.8 125L141.9 80L113.8 55Z";
const AFRICA =
  "M20 30L66.9 27L98.8 28L111.9 45L85.6 65L123.1 105L156.9 154L181.3 161L237.5 204L267.5 215L291.9 236L417.5 222L410 240L355.6 295L237.5 356L194.4 386L194.4 400L20 400Z";

/** Dubai to each destination; cities projected from longitude/latitude (equirectangular, 30–62°E). */
const DUBAI = "493.8 88";
type Destination = "oman" | "kenya";
const ROUTES: readonly { to: string; via: string; market?: Destination }[] = [
  { to: "552.5 104", via: "530 70", market: "oman" }, // Muscat
  { to: "333.1 93", via: "410 40" }, // Riyadh
  { to: "423.1 87", via: "460 62" }, // Doha
  { to: "357.1 46.3", via: "430 18" }, // Kuwait City
  { to: "405.9 77.8", via: "452 52" }, // Manama
  { to: "147.9 352.9", via: "330 190", market: "kenya" }, // Nairobi
];
/**
 * Dubai to Muscat is a short hop on a map drawn for Africa, so the Oman page crops to the Gulf; reach.css
 * scales its text and strokes back down by the same factor (--reach-zoom) so they read the same size.
 */
const ZOOM: Partial<Record<Destination, { viewBox: string; factor: number }>> = {
  oman: { viewBox: "400 30 240 158", factor: 640 / 240 },
};
const GCC_CITIES = [
  [333.1, 93],
  [423.1, 87],
  [357.1, 46.3],
  [405.9, 77.8],
] as const;

/**
 * Design Doc 8.3 "Locations / export": route lines draw from Dubai to the destinations, then a
 * light travels along each one. Only places AIMS names are labelled: its two offices, the GCC,
 * and the Oman and Kenya pages on aimsuae.me. Timing lives in signature/reach.css.
 *
 * `destination` (a T7 location page) keeps the offices and draws the one route to that market, which
 * lights up on arrival; without it the map is the homepage's and /contact's, unchanged.
 */
export function ReachMap({ labels, destination }: { labels: Labels; destination?: Destination }) {
  const routes = destination ? ROUTES.filter((r) => r.market === destination) : ROUTES;
  const shows = (market: Destination) => !destination || destination === market;
  const zoom = destination ? ZOOM[destination] : undefined;
  // A label sits a fixed on-screen distance from its dot, so its offset shrinks with the crop.
  const near = (at: number, offset: number) => Math.round((at + offset / (zoom?.factor ?? 1)) * 10) / 10;
  return (
    <svg
      className={zoom ? "reach-map reach-map-zoomed" : "reach-map"}
      viewBox={zoom?.viewBox ?? "0 0 640 420"}
      style={zoom ? ({ "--reach-zoom": zoom.factor } as CSSProperties) : undefined}
      role="img"
      aria-label={labels.mapLabel}
      direction="ltr"
    >
      <defs>
        <pattern id="reach-dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" className="fill-night-muted" />
        </pattern>
        {/* Land fades out away from Dubai, so the routes carry the eye rather than the coastline. */}
        <radialGradient id="reach-fade" cx="0.62" cy="0.3" r="0.75">
          <stop offset="0" className="reach-stop-near" />
          <stop offset="1" className="reach-stop-far" />
        </radialGradient>
        <mask id="reach-land">
          <rect width="640" height="420" fill="url(#reach-fade)" />
        </mask>
      </defs>
      <g mask="url(#reach-land)" className="reach-land">
        <path d={ARABIA} fill="url(#reach-dots)" />
        <path d={AFRICA} fill="url(#reach-dots)" />
      </g>
      <g fill="none" strokeWidth="1.4" strokeLinecap="round">
        {routes.map((r) => (
          <g key={r.to}>
            <path d={`M${DUBAI}Q${r.via} ${r.to}`} className="reach-route stroke-night-muted" pathLength="1" />
            <path
              d={`M${DUBAI}Q${r.via} ${r.to}`}
              className="reach-pulse stroke-lime"
              strokeWidth="2.6"
              pathLength="1"
            />
          </g>
        ))}
      </g>
      {!destination &&
        GCC_CITIES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" className="reach-city fill-night-text" />
        ))}
      {shows("oman") && <circle cx="552.5" cy="104" r="3.5" className="reach-city fill-night-text" />}
      {shows("kenya") && <circle cx="147.9" cy="352.9" r="3.5" className="reach-city fill-night-text" />}
      {destination &&
        routes.map((r) => {
          const [cx, cy] = r.to.split(" ");
          return <circle key={r.to} cx={cx} cy={cy} r="11" className="reach-arrive fill-lime" />;
        })}
      <circle cx="493.8" cy="88" r="14" className="reach-ring fill-lime" />
      <circle cx="493.8" cy="88" r="5.5" className="reach-office fill-lime" />
      <circle cx="476.9" cy="95.5" r="4.5" className="reach-office reach-office-small fill-lime" />
      <g className="reach-labels">
        <text x={near(493.8, 10.2)} y={near(88, -8)} className="reach-label-strong">
          {labels.dubai}
        </text>
        <text x={near(476.9, -8.9)} y={near(95.5, 22.5)} textAnchor="end" className="reach-label-strong">
          {labels.abuDhabi}
        </text>
        {/* Centred under its dot so the label never runs past the map's right edge. */}
        {shows("oman") && (
          <text x="552.5" y={near(104, 30)} textAnchor="middle">
            {labels.muscat}
          </text>
        )}
        {shows("kenya") && (
          <text x="160" y="372">
            {labels.nairobi}
          </text>
        )}
        {!destination && (
          <text x="372" y="30" className="reach-label-region">
            {labels.gcc}
          </text>
        )}
      </g>
    </svg>
  );
}
