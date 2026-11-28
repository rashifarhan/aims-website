import type { Globe } from "cobe";
import { easeOutExpo, facingPhi, GLOBE_THETA, nearestTurn, project, toCartesian } from "./globeMath";
import { GLOBE_PLACES, GLOBE_ROUTES, type GlobePlace } from "./globePlaces";

const TURN_MS = 1200;
const FRICTION = 0.92; // per 60 Hz frame
const RELEASE_GRACE_MS = 80;
// cobe uploads its land texture when the image loads without redrawing, so a still globe needs a few late frames.
const LATE_FRAMES_MS = [150, 600, 1500];
// The direction's grounds and lime (CLAUDE.md → Design rules → Palette), as 0..1 RGB for the shader.
const COLORS = {
  baseColor: [0.24, 0.42, 0.32],
  glowColor: [0.2, 0.38, 0.28],
  markerColor: [0.65, 0.84, 0.35],
  arcColor: [0.65, 0.84, 0.35],
} satisfies Record<string, [number, number, number]>;

const at = (id: string) => GLOBE_PLACES.find((p) => p.id === id);
const ARCS = GLOBE_ROUTES.flatMap(([a, b]) => {
  const from = at(a);
  const to = at(b);
  return from && to
    ? [{ from: [from.lat, from.lng] as [number, number], to: [to.lat, to.lng] as [number, number] }]
    : [];
});
const MARKERS = GLOBE_PLACES.map((p) => ({
  location: [p.lat, p.lng] as [number, number],
  size: p.office ? 0.05 : 0.035,
}));

type Pointer = { clientX: number; timeStamp: number; pointerId: number };

/**
 * The reach globe outside React: loads cobe once the globe nears the screen, draws AIMS's places and routes
 * (globePlaces.ts), keeps the ring on the focused place, and runs a frame loop only while the globe moves (a turn,
 * a drag or its glide), so nothing runs on a timer (Design rules → Motion). Reduced motion jumps instead of turning.
 */
export function createGlobeEngine(
  host: HTMLDivElement,
  ring: HTMLSpanElement,
  first: GlobePlace,
  onGl: (state: "ready" | "off") => void,
) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let phi = facingPhi(first.lng);
  let focus = toCartesian(first.lat, first.lng);
  let velocity = 0;
  let turn: { from: number; to: number; start: number } | null = null;
  let drag: { x: number; t: number; id: number } | null = null;
  let size = host.clientWidth;
  let globe: Globe | null = null;
  let raf = 0;
  let last = 0;
  let disposed = false;
  const timers: number[] = [];
  const canvas = document.createElement("canvas");
  canvas.className = "rg-canvas";

  const placeRing = () => {
    const p = project(focus, phi, GLOBE_THETA);
    ring.style.transform = `translate(${(p.x * size).toFixed(1)}px, ${(p.y * size).toFixed(1)}px)`;
    ring.style.opacity = p.depth > 0.1 ? "1" : "0";
  };
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    if (turn) {
      const t = Math.min(1, (now - turn.start) / TURN_MS);
      phi = turn.from + (turn.to - turn.from) * easeOutExpo(t);
      if (t >= 1) turn = null;
    } else if (!drag && Math.abs(velocity) > 1e-4) {
      phi += velocity * dt * 60;
      velocity *= Math.pow(FRICTION, dt * 60);
    } else if (!drag) velocity = 0;
    globe?.update({ phi });
    placeRing();
    if (turn || drag || velocity !== 0) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const kick = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  };

  const start = async () => {
    const { default: createGlobe } = await import("cobe");
    if (disposed) return;
    host.prepend(canvas);
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: size,
        height: size,
        phi,
        theta: GLOBE_THETA,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 5,
        ...COLORS,
        markers: MARKERS,
        arcs: ARCS,
        arcWidth: 0.6,
        arcHeight: 0.25,
      });
    } catch {
      globe = null;
    }
    // cobe hands back a working object even without WebGL; asking the canvas for its context tells them apart.
    onGl(globe && (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) ? "ready" : "off");
    kick();
    for (const ms of LATE_FRAMES_MS) timers.push(window.setTimeout(kick, ms));
  };

  const seen = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      seen.disconnect();
      void start();
    },
    { rootMargin: "300px 0px" },
  );
  seen.observe(host);
  const resize = new ResizeObserver(() => {
    size = host.clientWidth;
    globe?.update({ width: size, height: size });
    kick();
  });
  resize.observe(host);
  placeRing();

  return {
    focusOn(place: GlobePlace) {
      focus = toCartesian(place.lat, place.lng);
      const to = nearestTurn(phi, facingPhi(place.lng));
      velocity = 0;
      if (reduced) {
        phi = to;
        turn = null;
      } else turn = { from: phi, to, start: performance.now() };
      kick();
    },
    down(e: Pointer) {
      turn = null;
      velocity = 0;
      drag = { x: e.clientX, t: e.timeStamp, id: e.pointerId };
      kick();
    },
    move(e: Pointer) {
      if (!drag || e.pointerId !== drag.id) return;
      const delta = ((e.clientX - drag.x) / Math.max(size, 1)) * Math.PI;
      phi += delta;
      velocity = reduced ? 0 : (delta / Math.max(e.timeStamp - drag.t, 1)) * (1000 / 60);
      drag = { ...drag, x: e.clientX, t: e.timeStamp };
    },
    up(e: Pointer) {
      if (!drag || e.pointerId !== drag.id) return;
      // A release counts as a flick only while the pointer was still moving.
      if (e.timeStamp - drag.t > RELEASE_GRACE_MS) velocity = 0;
      drag = null;
      kick();
    },
    destroy() {
      disposed = true;
      seen.disconnect();
      resize.disconnect();
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      globe?.destroy();
      canvas.remove();
    },
  };
}

export type GlobeEngine = ReturnType<typeof createGlobeEngine>;
