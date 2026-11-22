import { DOOR_MODELS } from "@/components/home/DoorIllustration";
import "./door-denied.css";

type Labels = { alt: string; denied: string; reader: string; lock: string };

function Tag({ x, y, name, model }: { x: number; y: number; name: string; model: string }) {
  return (
    <g>
      <rect x={x} y={y} width="132" height="44" rx="10" className="fill-paper stroke-line" />
      <text x={x + 12} y={y + 18} className="door-denied-name">
        {name}
      </text>
      <text x={x + 12} y={y + 34} className="door-denied-model">
        {model}
      </text>
    </g>
  );
}

/**
 * The approved UNLOCK moment (DoorIllustration, Design Doc 8.2) played in reverse for the 404: the same
 * reader, leaf and lock, a card taps the reader, its light turns error red, the leaf shudders and stays
 * shut. This markup is the final frame, which reduced motion and no-JS visitors see; the sequence and its
 * timing live in door-denied.css. The SVG is one image whose label tells the same story in words.
 */
export function DoorDenied({ labels }: { labels: Labels }) {
  return (
    <svg className="door-denied" viewBox="0 0 440 460" role="img" aria-label={labels.alt} direction="ltr">
      <rect x="24" y="24" width="392" height="396" rx="4" className="fill-paper-2" />
      <path d="M8 420h424" className="stroke-line" strokeWidth="1.5" />

      <rect x="220" y="96" width="160" height="324" fill="none" className="stroke-ink" strokeWidth="2" />
      <g className="door-denied-leaf">
        <rect x="226" y="102" width="148" height="318" className="fill-paper stroke-ink" strokeWidth="1.5" />
        <rect x="242" y="120" width="116" height="124" fill="none" className="stroke-line" />
        <path d="M356 270v34" className="stroke-ink" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* The lock stays energised: its light is red from the start. */}
      <rect x="282" y="98" width="92" height="14" rx="3" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <circle cx="366" cy="105" r="2.6" className="fill-error" />
      <path d="M300 98l-24-36" className="stroke-ink" />
      <Tag x={238} y={18} name={labels.lock} model={DOOR_MODELS.lock} />

      <rect x="140" y="236" width="40" height="66" rx="7" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <rect x="148" y="264" width="24" height="26" rx="3" fill="none" className="stroke-line-strong" />
      <circle cx="160" cy="252" r="3.6" className="fill-line-strong" />
      <circle cx="160" cy="252" r="3.6" className="door-denied-led fill-error" />
      <path d="M140 300l-40 32" className="stroke-ink" />
      <Tag x={24} y={332} name={labels.reader} model={DOOR_MODELS.reader} />

      {/* The credential rests on the reader; the outer group holds its final place. */}
      <g transform="translate(146 268)">
        <g className="door-denied-card">
          <rect width="34" height="50" rx="5" className="fill-green-700" />
          <rect x="6" y="8" width="14" height="10" rx="2" className="fill-lime" />
          <path d="M6 36h20" className="stroke-paper" strokeOpacity="0.7" />
        </g>
      </g>

      <g className="door-denied-badge">
        <rect x="216" y="166" width="168" height="36" rx="18" className="fill-error" />
        <text x="300" y="189" textAnchor="middle" className="door-denied-label">
          ✕ {labels.denied}
        </text>
      </g>
    </svg>
  );
}
