import { LANE_MODELS } from "./data";

type Labels = { alt: string; people: string; vehicles: string };

/**
 * SIGNAL at an entrance (Design Doc 3 signal lines, 8): a swing-barrier lane and a car-park lane in
 * front view, in the line language of the door kit. This markup is the finished frame (card read,
 * panels open, plate read, boom up), which reduced-motion and no-JS visitors see; entrance-parking.css
 * plays the sequence once when MomentTrigger sets data-played. Only the models the prep names are drawn,
 * with no speeds or accuracy figures. The drawing stays LTR like every model code (Design Doc 13).
 */
export function LaneDrawing({ labels }: { labels: Labels }) {
  return (
    <svg className="ep-drawing" viewBox="0 0 760 420" role="img" aria-label={labels.alt} direction="ltr">
      <rect x="0" y="0" width="760" height="420" className="fill-paper-2" />
      <path d="M20 360h720" className="stroke-line-strong" strokeWidth="1.5" />
      <path d="M380 40v300" className="stroke-line" strokeDasharray="4 6" />
      <text x="200" y="60" textAnchor="middle" className="home-door-name">
        {labels.people}
      </text>
      <text x="600" y="60" textAnchor="middle" className="home-door-name">
        {labels.vehicles}
      </text>

      {/* People: a swing-barrier lane between two cabinets, reader on the left cabinet. */}
      <rect x="100" y="210" width="40" height="150" rx="6" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <rect x="260" y="210" width="40" height="150" rx="6" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <g className="fill-line-strong">
        <circle cx="134" cy="244" r="2.4" />
        <circle cx="134" cy="292" r="2.4" />
        <circle cx="266" cy="244" r="2.4" />
        <circle cx="266" cy="292" r="2.4" />
      </g>
      <rect
        x="141"
        y="236"
        width="59"
        height="64"
        rx="4"
        className="ep-panel ep-panel-start fill-green-50 stroke-green-700"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x="200"
        y="236"
        width="59"
        height="64"
        rx="4"
        className="ep-panel ep-panel-end fill-green-50 stroke-green-700"
        vectorEffect="non-scaling-stroke"
      />
      <rect x="104" y="186" width="32" height="24" rx="4" className="fill-paper stroke-ink" strokeWidth="1.6" />
      <circle cx="120" cy="198" r="3.6" className="fill-line-strong" />
      <circle cx="120" cy="198" r="3.6" className="ep-led fill-lime" />
      <path
        d="M136 192C164 188 180 180 189 170"
        fill="none"
        className="ep-wire stroke-green-700"
        strokeWidth="1.6"
        pathLength="1"
      />
      <circle cx="200" cy="160" r="14" className="ep-granted fill-green-700" />
      <path
        d="M194 160.5l3.5 3.5 7.5-7.5"
        fill="none"
        className="ep-tick stroke-paper"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
      />
      {/* The credential arrives at the reader; the outer group holds its final place. */}
      <g transform="translate(109 150)">
        <g className="ep-card">
          <rect width="22" height="32" rx="4" className="fill-green-700" />
          <rect x="4" y="6" width="10" height="7" rx="1.5" className="fill-lime" />
        </g>
      </g>
      <text x="200" y="392" textAnchor="middle" className="home-door-model ep-code">
        {LANE_MODELS.swing}
      </text>

      {/* Vehicles: a car in front view behind a boom barrier, read by a plate camera on a pole. */}
      <path d="M506 352l44-22v30Z" className="ep-cone fill-green-700" />
      <g className="ep-car">
        <path d="M540 292l14-34h72l14 34Z" className="fill-paper stroke-ink" strokeWidth="1.6" />
        <path d="M552 288l9-22h58l9 22Z" className="fill-paper-3" />
        <rect x="520" y="290" width="140" height="50" rx="12" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <circle cx="540" cy="308" r="6" className="fill-paper stroke-ink" />
        <circle cx="640" cy="308" r="6" className="fill-paper stroke-ink" />
        <rect x="530" y="340" width="18" height="18" rx="4" className="fill-ink" />
        <rect x="632" y="340" width="18" height="18" rx="4" className="fill-ink" />
        <rect x="570" y="316" width="40" height="16" rx="2" className="fill-paper stroke-line-strong" />
        <rect
          x="570"
          y="316"
          width="40"
          height="16"
          rx="2"
          fill="none"
          className="ep-plate stroke-green-700"
          strokeWidth="2"
        />
        <path d="M577 324h7m4 0h7m4 0h5" className="stroke-ink" strokeWidth="2" />
      </g>
      <rect x="488" y="346" width="18" height="12" rx="3" className="fill-paper stroke-ink" strokeWidth="1.4" />
      <path d="M730 360V200" className="stroke-ink" strokeWidth="2" />
      <rect x="700" y="190" width="38" height="18" rx="4" className="fill-paper stroke-ink" strokeWidth="1.6" />
      <circle cx="706" cy="199" r="3" className="fill-green-700" />
      <path
        d="M700 204C664 222 630 276 612 314"
        fill="none"
        className="ep-wire ep-wire-plate stroke-green-700"
        strokeWidth="1.6"
        pathLength="1"
      />
      <rect x="420" y="240" width="36" height="120" rx="6" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <g className="ep-boom">
        <rect x="446" y="278" width="250" height="9" rx="4" className="fill-paper stroke-ink" strokeWidth="1.6" />
        <path d="M500 279v7m40-7v7m40-7v7m40-7v7m40-7v7" className="stroke-green-700" strokeWidth="6" />
      </g>
      <circle cx="450" cy="282" r="5" className="fill-ink" />
      <text x="436" y="392" textAnchor="middle" className="home-door-model ep-code">
        {LANE_MODELS.barrier}
      </text>
      <text x="506" y="392" textAnchor="middle" className="home-door-model ep-code">
        {LANE_MODELS.radar}
      </text>
      <text x="712" y="180" textAnchor="middle" className="home-door-model ep-code">
        {LANE_MODELS.plate}
      </text>
    </svg>
  );
}
