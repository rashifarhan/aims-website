import "./hero-scene.css";

export type SceneName = "services" | "company" | "offices";

/**
 * A drawn hero scene for an inner page whose subject is not one product (client request, 25 Nov 2026: a product
 * photograph on the services, about or locations hub hero "does not make sense"). Line drawings in AIMS's greens, held
 * inside the hero's verified-frame brackets. No stand-in photograph here: on these pages a stock office would read as
 * AIMS's own premises (CLAUDE.md §2 Imagery). Decorative, so hidden from assistive tech; the hero copy carries the
 * meaning. The route draws once with the hero's entrance and then stands (CLAUDE.md §3 (1)); reduced motion shows it
 * drawn.
 */
export function HeroScene({ name }: { name: SceneName }) {
  return (
    <svg className="hero-scene" viewBox="0 0 480 360" aria-hidden="true" focusable="false">
      <Brackets />
      <line x1="40" y1="300" x2="440" y2="300" className="scene-ground" />
      {name === "services" && <Services />}
      {name === "company" && <Company />}
      {name === "offices" && <Offices />}
    </svg>
  );
}

/** The verified frame: four corner brackets, as on the home hero device and the review cards. */
function Brackets() {
  return <path className="scene-bracket" d="M16 44V16H44M436 16H464V44M464 316V344H436M44 344H16V316" />;
}

/** A station's node on the route: a ring and a lime core that light when the route reaches it. */
function Node({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g className="scene-node" style={{ animationDelay: `${delay}ms` }}>
      <circle cx={x} cy={y} r="11" className="scene-node-ring" />
      <circle cx={x} cy={y} r="5" className="scene-node-core" />
    </g>
  );
}

/** Supply, installation, support: a carton, a terminal fixed to a wall, a support shield, joined by one route. */
function Services() {
  return (
    <>
      {/* Supply: the carton */}
      <path className="scene-fill" d="M62 214L102 198L142 214V286L102 300L62 286Z" />
      <path className="scene-line" d="M62 214L102 230L142 214M102 230V300M82 206L122 222" />
      {/* Installation: a wall section with the terminal and its cable run */}
      <rect className="scene-wall" x="192" y="104" width="96" height="196" rx="4" />
      <rect className="scene-device" x="221" y="146" width="38" height="64" rx="7" />
      <rect className="scene-screen" x="227" y="153" width="26" height="28" rx="3" />
      <circle className="scene-lime" cx="240" cy="196" r="4" />
      <path className="scene-cable" d="M240 210V300" />
      {/* Support: the shield with its tick */}
      <path className="scene-fill" d="M380 182L418 196V230C418 256 400 274 380 284C360 274 342 256 342 230V196Z" />
      <path className="scene-tick" d="M364 232L376 244L398 220" pathLength="1" />
      <path className="scene-route" d="M102 318H240H380" pathLength="1" />
      <Node x={102} y={318} delay={200} />
      <Node x={240} y={318} delay={650} />
      <Node x={380} y={318} delay={1100} />
    </>
  );
}

/** What AIMS fits: an entrance with a turnstile, glass doors and a reader beside them that has just verified. */
function Company() {
  return (
    <>
      <path className="scene-wall" d="M64 300V108H416V300" />
      <path className="scene-line" d="M52 108H428" />
      {/* The turnstile: pedestal and arm */}
      <rect className="scene-device" x="96" y="222" width="30" height="78" rx="6" />
      <path className="scene-line" d="M126 246H170" />
      <circle className="scene-lime" cx="111" cy="234" r="3.5" />
      {/* Glass doors with handles */}
      <rect className="scene-glass" x="190" y="146" width="56" height="154" rx="3" />
      <rect className="scene-glass" x="246" y="146" width="56" height="154" rx="3" />
      <path className="scene-line" d="M238 214V236M254 214V236" />
      {/* The reader beside the door, verified */}
      <rect className="scene-device" x="326" y="186" width="34" height="56" rx="7" />
      <rect className="scene-screen" x="331" y="192" width="24" height="24" rx="3" />
      <circle className="scene-lime" cx="343" cy="230" r="3.5" />
      <path className="scene-route" d="M343 186V164H274V144" pathLength="1" />
      <circle className="scene-node-ring scene-badge" cx="274" cy="128" r="16" />
      <path className="scene-tick" d="M266 128L272 134L283 122" pathLength="1" />
    </>
  );
}

/** AIMS's two offices, Abu Dhabi and Dubai, as two skylines joined by the road between them. */
function Offices() {
  return (
    <>
      {/* Abu Dhabi, at the start */}
      <path className="scene-wall" d="M60 300V214H92V300M98 300V182H130V300M136 300V236H160V300" />
      <path className="scene-line" d="M106 196H122M106 212H122M106 228H122M68 228H84M68 244H84" />
      {/* Dubai, at the end */}
      <path className="scene-wall" d="M318 300V226H344V300M350 300V158L366 138L382 158V300M388 300V200H420V300" />
      <path className="scene-line" d="M358 176H374M358 194H374M358 212H374M396 216H412M396 232H412" />
      {/* The road between the offices, then a pin dropping onto each as the road reaches it */}
      <path className="scene-route" d="M126 178C190 262 300 112 366 120" pathLength="1" />
      <Pin x={126} tip={178} delay={200} />
      <Pin x={366} tip={120} delay={1100} />
    </>
  );
}

/** A map pin whose point rests at (x, tip), with a lime centre; it drops in from its point. */
function Pin({ x, tip, delay }: { x: number; tip: number; delay: number }) {
  const c = tip - 36;
  return (
    <g className="scene-node scene-pin-drop" style={{ animationDelay: `${delay}ms` }}>
      <path
        className="scene-pin"
        d={`M${x} ${tip}C${x} ${tip} ${x - 18} ${c + 16} ${x - 18} ${c}A18 18 0 1 1 ${x + 18} ${c}C${x + 18} ${c + 16} ${x} ${tip} ${x} ${tip}Z`}
      />
      <circle className="scene-lime" cx={x} cy={c} r="6" />
    </g>
  );
}
