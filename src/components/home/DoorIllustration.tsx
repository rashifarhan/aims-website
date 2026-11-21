import type { Dictionary } from "@/i18n/dictionaries";

/** Static final-state geometry from the approved door-kit prototype (Design Doc 10, T1). */
export function DoorIllustration({ labels }: { labels: Dictionary["home"]["door"] }) {
  return (
    <svg className="home-door-drawing" viewBox="0 0 760 600" role="img" aria-label={labels.alt}>
      <rect x="40" y="40" width="680" height="500" rx="4" className="fill-paper-2" />
      <g fill="none" className="stroke-line-strong" strokeWidth="1.5">
        <path d="M20 540h720M150 162C150 240 248 250 248 318M212 96C300 96 360 96 400 152M212 112C430 112 552 150 552 330" />
        <path d="M196 78V58h510v346" />
      </g>
      <rect x="300" y="150" width="180" height="390" className="fill-paper-3 stroke-ink" strokeWidth="2" />
      <g className="fill-paper stroke-ink" strokeWidth="1.5">
        <path d="M306 156h124v384H306Z" />
        <path d="M324 176h88v150h-88Z" />
        <path d="M416 356v36" strokeWidth="4" />
      </g>
      <g className="fill-paper stroke-ink" strokeWidth="1.8">
        <rect x="228" y="318" width="40" height="66" rx="7" />
        <rect x="80" y="78" width="132" height="84" rx="8" />
        <rect x="370" y="152" width="100" height="16" rx="3" />
        <rect x="532" y="330" width="40" height="40" rx="6" />
        <rect x="556" y="404" width="150" height="96" rx="6" />
        <path d="M540 508h182l-10 8H550Z" />
      </g>
      <g className="fill-green-700">
        <circle cx="248" cy="334" r="3.6" />
        <circle cx="100" cy="100" r="3" />
        <circle cx="112" cy="100" r="3" />
        <circle cx="462" cy="160" r="2.6" />
        <rect x="204" y="400" width="34" height="50" rx="5" />
      </g>
      <g className="stroke-green-700" fill="none" strokeWidth="1.8">
        <circle cx="552" cy="350" r="9" />
        <path d="M96 128h100M96 140h80M568 436h120M568 454h90M568 472h105" />
      </g>
      <g className="home-door-labels" textAnchor="middle" direction="ltr">
        <text x="145" y="200">
          {labels.controller}
        </text>
        <text x="198" y="300">
          {labels.reader}
        </text>
        <text x="420" y="135">
          {labels.lock}
        </text>
        <text x="590" y="320">
          {labels.exit}
        </text>
        <text x="220" y="478">
          {labels.card}
        </text>
        <text x="630" y="550">
          {labels.software}
        </text>
      </g>
    </svg>
  );
}
