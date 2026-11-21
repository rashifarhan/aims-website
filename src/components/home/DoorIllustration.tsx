import type { Dictionary } from "@/i18n/dictionaries";

type Labels = Dictionary["home"]["door"];

/** Model codes from the approved prototype; codes stay untranslated (Design Doc 13). */
export const DOOR_MODELS = {
  reader: "KR602 E/M",
  controller: "InBio Pro 160",
  lock: "AL-M280 · 280 kg",
  exit: "ALF B21",
  card: "ID card",
  software: "ZKAccess 3.5",
} as const;

function Tag({ x, y, width, name, model }: { x: number; y: number; width: number; name: string; model: string }) {
  return (
    <g className="home-door-tag">
      <rect x={x} y={y} width={width} height="44" rx="10" className="fill-paper stroke-line" />
      <text x={x + 12} y={y + 18} className="home-door-name">
        {name}
      </text>
      <text x={x + 12} y={y + 34} className="home-door-model">
        {model}
      </text>
    </g>
  );
}

/**
 * The approved door-kit prototype's final frame (docs/prototypes/door-kit). On the premium
 * homepage it assembles in the prototype's order when it scrolls into view: reader, controller,
 * lock, exit button, software, then the card taps, the LEDs turn green, the door opens and
 * "Access granted" shows (Design Doc 8.2). Each `door-part` is timed in sections.css; this
 * markup is the finished frame, which reduced motion and no-JS visitors see.
 */
export function DoorIllustration({ labels }: { labels: Labels }) {
  return (
    <svg className="home-door-drawing" viewBox="0 0 760 600" role="img" aria-label={labels.alt} direction="ltr">
      <rect x="40" y="40" width="680" height="500" rx="4" className="fill-paper-2" />
      <path d="M20 540h720" className="stroke-line" strokeWidth="1.5" />

      <rect x="300" y="150" width="180" height="390" fill="none" className="stroke-ink" strokeWidth="2" />
      <rect x="306" y="156" width="168" height="384" className="fill-paper-3" />
      <g className="door-leaf">
        <rect x="306" y="156" width="168" height="384" className="fill-paper stroke-ink" strokeWidth="1.5" />
        <rect x="324" y="176" width="132" height="150" fill="none" className="stroke-line" />
        <path d="M448 356v36" className="stroke-ink" strokeWidth="4" strokeLinecap="round" />
      </g>

      <g className="door-part door-wires" fill="none" strokeWidth="1.6">
        <path d="M150 162C150 240 248 250 248 318" className="door-wire stroke-line-strong" pathLength="1" />
        <path d="M212 96C300 96 360 96 400 152" className="door-wire stroke-line-strong" pathLength="1" />
        <path d="M212 112C430 112 552 150 552 330" className="door-wire stroke-line-strong" pathLength="1" />
      </g>

      <g className="door-part door-reader">
        <rect x="228" y="318" width="40" height="66" rx="7" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <rect x="236" y="346" width="24" height="26" rx="3" fill="none" className="stroke-line-strong" />
        <circle cx="248" cy="334" r="3.6" className="fill-line-strong" />
        <circle cx="248" cy="334" r="3.6" className="door-led fill-lime" />
        <path d="M228 350h-80" className="home-door-tag stroke-ink" />
        <Tag x={40} y={328} width={108} name={labels.reader} model={DOOR_MODELS.reader} />
      </g>

      <g className="door-part door-controller">
        <rect x="80" y="78" width="132" height="84" rx="8" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <circle cx="100" cy="100" r="3" className="fill-green-700" />
        <circle cx="112" cy="100" r="3" className="fill-green-700" />
        <path d="M96 128h100M96 140h80" className="stroke-line-strong" strokeWidth="1.2" />
        <Tag x={80} y={170} width={160} name={labels.controller} model={DOOR_MODELS.controller} />
      </g>

      <g className="door-part door-lock">
        <rect x="370" y="152" width="100" height="16" rx="3" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <circle cx="462" cy="160" r="2.6" className="fill-error" />
        <circle cx="462" cy="160" r="2.6" className="door-led fill-lime" />
        <path d="M470 160l66-42" className="home-door-tag stroke-ink" />
        <Tag x={536} y={92} width={150} name={labels.lock} model={DOOR_MODELS.lock} />
      </g>

      <g className="door-part door-exit">
        <rect x="532" y="330" width="40" height="40" rx="6" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <circle cx="552" cy="350" r="9" fill="none" className="stroke-green-700" strokeWidth="1.8" />
        <path d="M572 350h22" className="home-door-tag stroke-ink" />
        <Tag x={594} y={328} width={118} name={labels.exit} model={DOOR_MODELS.exit} />
      </g>

      <g className="door-part door-software">
        <path
          d="M196 78V58h510v346"
          fill="none"
          className="door-wire stroke-green-700"
          strokeWidth="1.4"
          pathLength="1"
        />
        <rect x="556" y="404" width="150" height="96" rx="6" className="fill-paper stroke-ink" strokeWidth="1.8" />
        <path d="M540 508h182l-10 8H550Z" className="fill-paper stroke-ink" strokeWidth="1.5" />
        <rect x="564" y="412" width="134" height="16" className="fill-green-50" />
        <text x="570" y="424" className="home-door-screen fill-green-700">
          {DOOR_MODELS.software} · {labels.events}
        </text>
      </g>

      {/* The credential arrives at the reader; the outer group holds its final place. */}
      <g transform="translate(231 326)">
        <g className="door-card">
          <rect width="34" height="50" rx="5" className="fill-green-700" />
          <rect x="6" y="8" width="14" height="10" rx="2" className="fill-lime" />
          <path d="M6 36h20" className="stroke-paper" strokeOpacity="0.7" />
        </g>
      </g>

      <g className="door-log">
        <rect x="564" y="434" width="134" height="20" className="fill-paper stroke-line" />
        <text x="570" y="448" className="home-door-screen">
          08:17 {labels.logRow} ✓
        </text>
      </g>

      <g className="door-granted">
        <rect x="300" y="94" width="180" height="36" rx="18" className="fill-green-700" />
        <text x="390" y="117" textAnchor="middle" className="home-door-granted">
          ✓ {labels.granted}
        </text>
      </g>
      <text x="200" y="572" textAnchor="middle" className="home-door-model">
        {labels.outside}
      </text>
      <text x="600" y="572" textAnchor="middle" className="home-door-model">
        {labels.inside}
      </text>
    </svg>
  );
}
