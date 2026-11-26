import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { DOOR_BEATS, doorStep } from "@/lib/doorStep";
import type { DoorScene } from "./doorScene";

/** Highlights the active part in the list (and `data-step` on the section, for tests), or none once verified. */
function marker(s: DoorScene) {
  let shown = -1;
  return (step: number) => {
    if (step === shown) return;
    shown = step;
    s.section.dataset.step = step ? String(step) : "done";
    s.items.forEach((item, i) => {
      if (i + 1 === step) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
  };
}

/** A signal leaving one end of a wire: a short lime pulse runs along it while the green trail draws behind. */
function signal(tl: gsap.core.Timeline, trail: SVGElement, pulse: SVGElement | null, reverse: boolean, at: number) {
  const [from, to] = reverse ? ["100% 100%", "0% 100%"] : ["0% 0%", "0% 100%"];
  tl.fromTo(trail, { drawSVG: from }, { drawSVG: to, duration: 0.8, ease: "power1.inOut" }, at);
  if (!pulse) return;
  const [head, tail] = reverse ? ["92% 100%", "0% 8%"] : ["0% 8%", "92% 100%"];
  tl.fromTo(pulse, { drawSVG: head }, { drawSVG: tail, duration: 0.8, ease: "power1.inOut" }, at)
    .fromTo(pulse, { opacity: 0 }, { opacity: 1, duration: 0.08 }, at)
    .to(pulse, { opacity: 0, duration: 0.12 }, at + 0.7);
}

/**
 * The approved kit's order of events (docs/prototypes/door-kit), one beat per part (DOOR_BEATS): the card swings in
 * to the reader and its light turns lime; the signal runs to the controller; the controller reports to ZKBio CVAccess and
 * the event row appears; the signal runs to the EM lock, its light turns lime and the magnet lets go, the leaf opens
 * and "Access granted" appears; the exit button's input closes the circuit; the hero's lime tick draws on its night
 * disc. Parts wait at a third of their strength until their beat. Transform, opacity and stroke drawing only.
 */
export function doorTimeline(s: DoorScene, scrollTrigger?: ScrollTrigger.Vars) {
  const [, reader, controller, software, lock, exit, verified] = DOOR_BEATS;
  const mark = marker(s);
  gsap.set([s.reader, s.controller, s.software, s.lock, s.exit], { opacity: 0.35 });
  gsap.set([s.readerLed, s.lockLed], { opacity: 0 });
  gsap.set(s.leaf, { scaleX: 1, svgOrigin: "0 0" });
  // The badge comes with the door; its tick waits for the circuit to close.
  gsap.set(s.tick, { drawSVG: "0%" });
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    paused: !scrollTrigger,
    scrollTrigger,
    onUpdate: () => mark(doorStep(tl.time())),
  });
  tl.fromTo(s.card, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.05)
    .fromTo(
      s.card,
      { x: -121, y: 104, rotation: -14 },
      { x: 0, y: 0, rotation: 0, duration: 0.8, ease: "power2.out" },
      0.05,
    )
    .to(s.reader, { opacity: 1, duration: 0.3 }, reader)
    .to(s.readerLed, { opacity: 1, duration: 0.1 }, reader + 0.2);
  signal(tl, s.readerTrail, s.readerPulse, true, controller);
  tl.to(s.controller, { opacity: 1, duration: 0.3 }, controller + 0.7)
    .to(s.software, { opacity: 1, duration: 0.3 }, software)
    .fromTo(s.softwareWire, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "power1.inOut" }, software)
    .fromTo(s.log, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, software + 0.6);
  signal(tl, s.lockTrail, s.lockPulse, false, lock);
  tl.to(s.lock, { opacity: 1, duration: 0.3 }, lock + 0.6)
    .to(s.lockLed, { opacity: 1, duration: 0.1 }, lock + 0.8)
    .fromTo(s.lockBody, { y: 0 }, { y: -2, duration: 0.2, ease: "power2.out" }, lock + 0.8)
    .to(s.leaf, { scaleX: 0.74, duration: 0.8, ease: "power2.inOut" }, lock + 1)
    .fromTo(
      s.granted,
      { opacity: 0, scale: 0.96, transformOrigin: "50% 50%" },
      { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
      lock + 1.5,
    );
  signal(tl, s.exitTrail, null, true, exit);
  tl.to(s.exit, { opacity: 1, duration: 0.3 }, exit + 0.6)
    .fromTo(
      s.disc,
      { scale: 0.7, transformOrigin: "50% 50%" },
      { scale: 1, duration: 0.3, ease: "back.out(2)" },
      verified,
    )
    .to(s.tick, { drawSVG: "100%", duration: 0.35, ease: "power2.out" }, verified + 0.1)
    .to({}, { duration: 0.4 });
  mark(doorStep(0));
  return tl;
}

/** From 1024px on a screen the section fits: the content pins, centred below the header, and the timeline scrubs
 * across 2.4 viewports. The page's one pin (CLAUDE.md §3). */
export function pinnedDoor(s: DoorScene) {
  const header = () => document.querySelector("header")?.offsetHeight ?? 0;
  return doorTimeline(s, {
    trigger: s.wrap,
    start: () => `top ${header() + Math.max(0, (innerHeight - header() - s.wrap.offsetHeight) / 2)}px`,
    end: () => `+=${Math.round(innerHeight * 2.4)}`,
    pin: true,
    scrub: 0.6,
    invalidateOnRefresh: true,
  });
}

/** Below 1024px (or on a short screen): no pin. Each beat plays forward once as the drawing rises through the
 * viewport, one trigger per step, and each part in the list rises in as it enters. */
export function flowDoor(s: DoorScene) {
  const tl = doorTimeline(s);
  let target = 0;
  const ends = [...DOOR_BEATS.slice(1), tl.duration()];
  ends.forEach((end, k) => {
    ScrollTrigger.create({
      trigger: s.stage,
      start: `top ${72 - k * 7}%`,
      once: true,
      onEnter: () => {
        if (end <= target) return;
        target = end;
        tl.tweenTo(end, { duration: (end - tl.time()) * 0.55, ease: "none", overwrite: true });
      },
    });
  });
  s.items.forEach((item) =>
    gsap.from(item, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 92%", once: true },
    }),
  );
}
