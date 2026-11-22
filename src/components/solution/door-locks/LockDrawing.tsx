import type { Dictionary } from "@/i18n/dictionaries";

type Copy = Dictionary["solutionDoorLocks"]["unlock"];

/** Codes stay untranslated (Design Doc 13): the hero lock and the app its spec names. */
const LOCK_MODEL = "TL800";
const APP_NAME = "ZSmart App";

function Tag({ x, y, width, name, model }: { x: number; y: number; width: number; name: string; model: string }) {
  return (
    <>
      <rect x={x} y={y} width={width} height="44" rx="10" className="fill-paper stroke-line" />
      <text x={x + 12} y={y + 18} className="home-door-name">
        {name}
      </text>
      <text x={x + 12} y={y + 34} className="lk-code">
        {model}
      </text>
    </>
  );
}

/**
 * UNLOCK for one smart lock (Design Doc 8.2), drawn after the homepage door (DoorIllustration) but with
 * a standalone lock: a fingertip on the TL800's sensor, the light turns green, the bolt draws back, the
 * door opens and the unlock reaches the phone app. This markup is the finished frame, which reduced
 * motion and no-JS visitors see; unlock.css plays it once. The phone row is illustrative (labelled).
 * The outdoor unit keeps the TL800's 400 × 74 mm proportion (spec "Outdoor unit dimensions").
 */
export function LockDrawing({ copy }: { copy: Copy }) {
  return (
    // Anchors stay left-to-right in Arabic so labels keep their places; text still shapes RTL.
    <svg className="lk-drawing" viewBox="40 40 680 480" role="img" aria-label={copy.alt} direction="ltr">
      <rect x="40" y="40" width="680" height="480" className="fill-paper-2" />
      <path d="M40 500h680" className="stroke-line" strokeWidth="1.5" />
      <text x="64" y="80" className="home-door-model">
        {copy.sample}
      </text>

      <rect x="180" y="110" width="200" height="390" fill="none" className="stroke-ink" strokeWidth="2" />
      <rect x="186" y="116" width="188" height="384" className="fill-paper-3" />
      <g className="lk-leaf">
        {/* Drawn under the leaf, so only the part thrown into the frame shows until it retracts. */}
        <rect x="352" y="318" width="40" height="8" rx="2" className="lk-bolt fill-ink-600" />
        <rect x="186" y="116" width="188" height="384" className="fill-paper stroke-ink" strokeWidth="1.5" />
        <rect x="204" y="136" width="152" height="112" fill="none" className="stroke-line" />
        <rect x="330" y="262" width="30" height="162" rx="10" className="fill-ink" />
        <circle cx="345" cy="282" r="3" className="fill-ink-600" />
        <circle cx="345" cy="282" r="3" className="lk-led fill-lime" />
        <circle cx="345" cy="306" r="8" className="fill-ink-700 stroke-ink-600" />
        <circle cx="345" cy="306" r="12" fill="none" className="lk-ring stroke-lime" strokeWidth="2" pathLength="1" />
        <g className="fill-ink-600">
          {[332, 344, 356].flatMap((y) =>
            [338, 345, 352].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />),
          )}
        </g>
        <rect x="338" y="376" width="14" height="36" rx="7" className="fill-ink-700" />
        <path d="M334 328v-22a11 11 0 0 1 22 0v22" fill="none" className="lk-finger stroke-paper" strokeWidth="2" />
      </g>

      <path
        d="M318 282C410 196 500 196 556 234"
        fill="none"
        className="lk-signal stroke-green-700"
        strokeWidth="1.6"
        pathLength="1"
      />

      <rect x="556" y="170" width="134" height="244" rx="18" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <path d="M607 184h32" className="stroke-line-strong" strokeWidth="3" strokeLinecap="round" />
      <rect x="566" y="196" width="114" height="200" rx="6" className="fill-paper-2" />
      <path d="M576 304h90M576 326h70M576 348h80" className="stroke-line-strong" strokeWidth="1.4" />
      <g className="lk-record">
        <rect x="570" y="232" width="106" height="48" rx="8" className="fill-green-50 stroke-line" />
        <circle cx="588" cy="256" r="9" className="fill-green-700" />
        <path d="m583.5 256 3 3 6-6" fill="none" className="stroke-paper" strokeWidth="2" strokeLinecap="round" />
        <text x="604" y="252" className="home-door-name">
          {copy.record}
        </text>
        <text x="604" y="268" className="home-door-screen">
          {copy.recordMethod}
        </text>
      </g>
      <Tag x={556} y={432} width={134} name={copy.appTag} model={APP_NAME} />

      {/* Points at the lock where it rests once the door is open, so it shows with the last frame. */}
      <g className="lk-tag">
        <path d="M318 354H400" className="stroke-ink" />
        <Tag x={400} y={332} width={120} name={copy.lockTag} model={LOCK_MODEL} />
      </g>
    </svg>
  );
}
