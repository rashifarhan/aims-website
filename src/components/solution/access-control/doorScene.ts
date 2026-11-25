const ELEMENTS = {
  reader: ".door-reader",
  controller: ".door-controller",
  software: ".door-software",
  lock: ".door-lock",
  exit: ".door-exit",
  card: ".door-card",
  readerLed: ".door-reader .door-led",
  lockLed: ".door-lock .door-led",
  lockBody: ".door-lock-body",
  softwareWire: ".door-software .door-wire",
  log: ".door-log",
  leaf: ".door-leaf",
  granted: ".door-granted",
  disc: ".door-verified circle",
  tick: ".door-verified path",
  readerTrail: '.door-trail[data-wire="reader"]',
  lockTrail: '.door-trail[data-wire="lock"]',
  exitTrail: '.door-trail[data-wire="exit"]',
  readerPulse: '.door-pulse[data-wire="reader"]',
  lockPulse: '.door-pulse[data-wire="lock"]',
} as const;

type Pieces = { [K in keyof typeof ELEMENTS]: SVGElement };

/** The door section's moving parts, read from the server-rendered drawing (DoorIllustration) and list (DoorParts). */
export type DoorScene = Pieces & { section: HTMLElement; wrap: HTMLElement; stage: HTMLElement; items: HTMLElement[] };

export function doorScene(section: HTMLElement): DoorScene | null {
  const wrap = section.querySelector<HTMLElement>(":scope > .wrap");
  const stage = section.querySelector<HTMLElement>(".home-door-stage");
  const items = [...section.querySelectorAll<HTMLElement>("[data-door-step]")];
  const found = Object.entries(ELEMENTS).map(([key, selector]) => [key, section.querySelector(selector)] as const);
  if (!wrap || !stage || items.length !== 6 || found.some(([, el]) => !(el instanceof SVGElement))) return null;
  return { ...(Object.fromEntries(found) as Pieces), section, wrap, stage, items };
}

const KEPT = ["style", "transform", "data-svg-origin"] as const;

/**
 * Records the server-rendered frame's own attributes and returns a function that puts them back. GSAP's revert
 * leaves SVG transforms as equivalent matrices, and a scrub caught mid-flight by a navigation can render once more
 * after its tweens were reverted; restoring last makes the finished frame exact (reduced motion, rest, unmount).
 */
export function keepFrame(s: DoorScene): () => void {
  const elements = [...Object.keys(ELEMENTS).map((key) => s[key as keyof Pieces]), ...s.items];
  const saved = elements.map((el) => KEPT.map((name) => el.getAttribute(name)));
  return () =>
    elements.forEach((el, i) =>
      KEPT.forEach((name, k) => {
        const value = saved[i][k];
        if (value === null) el.removeAttribute(name);
        else el.setAttribute(name, value);
      }),
    );
}
