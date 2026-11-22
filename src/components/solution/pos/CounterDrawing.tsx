import type { Dictionary } from "@/i18n/dictionaries";

type Copy = Dictionary["solutionPos"]["counter"];

/** Codes stay untranslated (Design Doc 13). */
const TERMINAL_MODEL = "ZKBio900";
const PRINTER_MODEL = "ZKP8001";

function Tag({ x, y, width, name, model }: { x: number; y: number; width: number; name: string; model: string }) {
  return (
    <>
      <rect x={x} y={y} width={width} height="44" rx="10" className="fill-paper stroke-line" />
      <text x={x + 12} y={y + 18} className="home-door-name">
        {name}
      </text>
      <text x={x + 12} y={y + 34} className="pc-code">
        {model}
      </text>
    </>
  );
}

/**
 * VERIFY at the counter (Design Doc 8.2), on the one POS model whose data names fingerprint verification
 * (the ZKBio900 series' title and overview): a fingertip on the pad, three signal lines meet in the green
 * check, the sale lines appear, the LED customer display lights (spec "LED (8C digital tube)") and a
 * receipt rises from the ZKP8001. No prices, amounts or names (CLAUDE.md §1). This markup is the
 * finished frame, which reduced motion and no-JS visitors see; counter.css plays it once.
 */
export function CounterDrawing({ copy }: { copy: Copy }) {
  return (
    // Anchors stay left-to-right in Arabic so labels keep their places; text still shapes RTL.
    <svg className="pc-drawing" viewBox="0 0 720 450" role="img" aria-label={copy.alt} direction="ltr">
      <rect width="720" height="450" className="fill-paper-2" />
      <path d="M0 366h720" className="stroke-line" strokeWidth="1.5" />
      <text x="28" y="44" className="home-door-model">
        {copy.sample}
      </text>

      {/* Customer display on the terminal's side */}
      <path d="M206 214h34" className="stroke-ink-700" strokeWidth="6" />
      <rect x="132" y="196" width="78" height="36" rx="6" className="fill-ink" />
      <g className="pc-digits fill-lime">
        {[144, 160, 176, 192].map((x) => (
          <rect key={x} x={x} y="212" width="10" height="4" rx="1" />
        ))}
      </g>

      {/* ZKBio900: a 15-inch all-in-one on a stand, fingerprint pad on the base */}
      <rect x="240" y="86" width="260" height="196" rx="14" className="fill-ink" />
      <rect x="252" y="98" width="236" height="150" rx="6" className="fill-paper" />
      <rect x="354" y="282" width="32" height="44" className="fill-ink-700" />
      <rect x="290" y="324" width="160" height="40" rx="10" className="fill-ink" />
      <rect x="396" y="330" width="38" height="28" rx="6" className="fill-ink-700 stroke-ink-600" />
      <path
        d="M405 352c0-8 3-14 10-14s10 6 10 14M410 352c0-5 2-9 5-9s5 4 5 9"
        fill="none"
        className="stroke-line-strong"
        strokeWidth="1.2"
      />
      <g className="pc-sale">
        <path d="M276 124h112M276 146h88M276 168h100" className="stroke-line-strong" strokeWidth="8" />
        <path d="M412 124h52M424 146h40M418 168h46" className="stroke-line" strokeWidth="8" />
      </g>
      <g fill="none" strokeWidth="1.6" strokeLinecap="round">
        <path d="M408 330C408 300 380 290 374 236" className="pc-line stroke-lime" pathLength="1" />
        <path d="M415 330C415 296 372 284 370 236" className="pc-line stroke-lime" pathLength="1" />
        <path d="M422 330C422 298 366 290 366 236" className="pc-line stroke-lime" pathLength="1" />
      </g>
      <g className="pc-check">
        <circle cx="370" cy="214" r="22" className="fill-green-700" />
      </g>
      <path
        d="m359 214 7.5 7.5L382 206"
        fill="none"
        className="pc-tick stroke-paper"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
      />
      <path d="M405 344a10 10 0 0 1 20 0v32h-20Z" fill="none" className="pc-finger stroke-green-700" strokeWidth="2" />

      {/* ZKP8001 receipt printer, wired to the terminal (its USB, serial and Ethernet interfaces) */}
      <path
        d="M450 344C500 344 500 330 540 330"
        fill="none"
        className="pc-wire stroke-line-strong"
        strokeWidth="1.6"
        pathLength="1"
      />
      <g className="pc-receipt">
        <path d="M570 184h60v108h-60Z" className="fill-paper stroke-line" />
        <path d="M580 204h40M580 220h32M580 236h36M580 262h40" className="stroke-line-strong" strokeWidth="4" />
      </g>
      <rect x="544" y="278" width="112" height="86" rx="10" className="fill-paper stroke-ink" strokeWidth="1.8" />
      <path d="M562 290h76" className="stroke-ink" strokeWidth="3" strokeLinecap="round" />
      <circle cx="636" cy="342" r="3" className="fill-green-700" />

      <Tag x={290} y={384} width={172} name={copy.terminalTag} model={TERMINAL_MODEL} />
      <Tag x={526} y={384} width={160} name={copy.printerTag} model={PRINTER_MODEL} />
    </svg>
  );
}
