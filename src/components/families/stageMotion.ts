import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { setWheelGate, startSmoothScroll, stopSmoothScroll } from "@/components/motion/smoothScroll";
import {
  LAYER_TRAVEL,
  LEAVE_DRIFT,
  arrival,
  cover,
  settleTarget,
  shownFamily,
  stagePosition,
  stageSnapPoints,
  stageUnits,
  type StageLayer,
} from "@/lib/familyStage";
import { oneFamilyPerGesture } from "./wheelGesture";

/** Each family's stretch of scroll, as a share of the viewport height (Design rules → Motion). */
const STRETCH = 0.7;
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
/** A settle takes longer the further it has to go: a short correction is quick, a whole family at most 0.6 s. */
const settleSeconds = (distance: number) =>
  Math.min(0.6, 0.25 + (0.35 * distance) / Math.max(1, STRETCH * window.innerHeight));
/** A wheel or trackpad has stopped once no input has come for this long: longer than the gap between the notches of
 * a mouse wheel turned at an even pace (120–200 ms), so a settle never starts in the middle of a gesture. */
const WHEEL_IDLE_MS = 280;
/** Keyboard and scrollbar scrolling settle once the page has stood still this long. */
const NATIVE_IDLE_MS = 250;

type Stage = { slide: HTMLElement; layers: [HTMLElement, number][] };

/**
 * The family slider's scroll engine (lazy chunk; CLAUDE.md → Design rules → Motion and scroll engine). The section
 * pins and the scroll position drives every frame: the leaving family is covered from its trailing edge, evenly with
 * the scroll, while it drifts away, the arriving family's layers come in with parallax, and the scroll settles
 * softly on each family. Lenis smooths the wheel on fine pointers (settle() below settles it); touch screens swipe
 * a carousel instead (swipeStage.ts), and a coarse pointer that still hovers keeps native scroll with ScrollTrigger's
 * scrub smoothing and snap. Only transform and clip-path are written.
 */
export function startStage(root: HTMLElement, onShown: (index: number) => void) {
  const stages: Stage[] = [...root.querySelectorAll<HTMLElement>(".fam-slide")].map((slide) => ({
    slide,
    layers: [...slide.querySelectorAll<HTMLElement>("[data-layer]")].map((el) => [
      el,
      LAYER_TRAVEL[el.dataset.layer as StageLayer] ?? 0,
    ]),
  }));
  const count = stages.length;
  const rtl = getComputedStyle(root).direction === "rtl";
  const sign = rtl ? -1 : 1;
  let width = 0;
  let shown = -1;
  let painted: number[] = [];

  root.dataset.mode = "pinned";

  const paint = (position: number) => {
    const from = Math.min(count - 1, Math.floor(position));
    const t = position - from;
    const live = t > 0 && from < count - 1 ? [from, from + 1] : [from];
    // Reset only the floods that were moving last frame and are not now.
    for (const k of painted) {
      if (live.includes(k)) continue;
      const s = stages[k];
      if (!s) continue;
      s.slide.style.clipPath = "";
      s.slide.style.visibility = "";
      s.slide.style.zIndex = "";
      for (const [el] of s.layers) el.style.transform = "";
    }
    painted = live;
    const leaving = stages[from];
    if (!leaving) return;
    leaving.slide.style.visibility = "visible";
    leaving.slide.style.zIndex = "2";
    const c = live.length > 1 ? cover(t) : 0;
    leaving.slide.style.clipPath = c ? (rtl ? `inset(0 0 0 ${c * 100}%)` : `inset(0 ${c * 100}% 0 0)`) : "";
    for (const [el] of leaving.layers)
      el.style.transform = c ? `translate3d(${-sign * c * LEAVE_DRIFT * width}px,0,0)` : "";
    const arriving = live.length > 1 ? stages[from + 1] : undefined;
    if (arriving) {
      const a = arrival(t);
      arriving.slide.style.visibility = "visible";
      arriving.slide.style.zIndex = "1";
      for (const [el, travel] of arriving.layers) {
        el.style.transform = `translate3d(${sign * (1 - a) * travel * width}px,0,0)`;
      }
    }
    root.style.setProperty("--pos", position.toFixed(4));
    const next = shownFamily(position, count);
    if (next !== shown) {
      shown = next;
      stages.forEach((s, k) => {
        s.slide.inert = k !== shown;
        s.slide.dataset.shown = String(k === shown);
      });
      onShown(shown);
    }
  };

  const lenis = startSmoothScroll();
  const pin: { trigger?: ScrollTrigger } = {};
  // With Lenis, once the wheel stops the scroll settles the way it was going if it got far enough into a change, and
  // back otherwise (Design rules → Motion). Keyboard and scrollbar scrolling settle on the nearer family.
  let wait = 0;
  let direction: -1 | 0 | 1 = 0;
  // A tab, arrow or key jump is never settled halfway: a settle left over from the scroll before it would pull the
  // page back to the family it is leaving. The visitor's next wheel input ends the jump.
  let jumping = false;
  // Where a settle or jump under way is taking the page. Lenis reports the page's position mid-way, so a gesture that
  // starts during one counts from here (wheelGesture.ts), and a notch during a settle moves on from the family the
  // page is heading for.
  let heading: number | null = null;
  const takeHeading = () => {
    const h = heading;
    heading = null;
    return h;
  };
  const arrive = () => {
    heading = null;
    jumping = false;
  };
  const settle = () => {
    if (!lenis || !pin.trigger || jumping) return;
    const target = settleTarget(lenis.targetScroll, pin.trigger.start, pin.trigger.end, count, direction);
    if (target === null || Math.abs(target - lenis.targetScroll) <= 1) return;
    heading = target;
    const duration = settleSeconds(Math.abs(target - lenis.animatedScroll));
    lenis.scrollTo(target, { duration, easing: inOutCubic, onComplete: arrive });
  };
  const settleLater = (delay: number) => {
    window.clearTimeout(wait);
    wait = window.setTimeout(settle, delay);
  };
  const offWheel = lenis?.on("virtual-scroll", ({ deltaY }) => {
    jumping = false;
    if (deltaY) direction = deltaY > 0 ? 1 : -1;
    settleLater(WHEEL_IDLE_MS);
  });
  // Only keyboard and scrollbar scrolling count as native. Lenis's own glide is "smooth", and the event it sends as a
  // glide ends reads `false`: taking that for native dropped the wheel's direction, so a short flick went back.
  const offScroll = lenis?.on("scroll", () => {
    if (lenis.isScrolling !== "native") return;
    direction = 0;
    heading = null;
    settleLater(NATIVE_IDLE_MS);
  });

  const progress = { value: 0 };
  const tween = gsap.to(progress, {
    value: 1,
    ease: "none",
    onUpdate: () => paint(stagePosition(progress.value, count)),
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => `+=${stageUnits(count) * STRETCH * window.innerHeight}`,
      pin: true,
      // The section's own wrapper is the spacer: ScrollTrigger then never re-parents the section, which would restart
      // the entrance's CSS animations halfway through.
      pinSpacer: root.parentElement ?? undefined,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Lenis already smooths the wheel; native touch scroll gets a short glide instead.
      scrub: lenis ? true : 0.5,
      snap: lenis
        ? undefined
        : { snapTo: stageSnapPoints(count), duration: { min: 0.3, max: 0.6 }, delay: 0.2, ease: "power3.inOut" },
      onRefresh: () => {
        width = root.querySelector<HTMLElement>(".fam-frame")?.offsetWidth ?? window.innerWidth;
      },
    },
  });
  pin.trigger = tween.scrollTrigger;
  if (lenis) setWheelGate(oneFamilyPerGesture(lenis, () => pin.trigger, count, takeHeading));

  const jump = (index: number) => {
    if (!pin.trigger) return;
    const { start, end } = pin.trigger;
    const k = Math.min(count - 1, Math.max(0, index));
    const top = start + (stageSnapPoints(count)[k] ?? 0) * (end - start);
    window.clearTimeout(wait);
    if (lenis) {
      jumping = true;
      heading = top;
      lenis.scrollTo(top, { duration: 1.1, easing: inOutCubic, onComplete: arrive });
    } else window.scrollTo({ top, behavior: "smooth" });
  };

  // ↑ ↓, Page Up/Down and Space step one family while the stage is on screen, and hand back to the page's own
  // keyboard scrolling past the first and last family (owner, 28 Nov 2026). Typing, a focused control's own Space and
  // open dialogs are left alone.
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !pin.trigger) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest("input, textarea, select, [contenteditable], dialog")) return;
    if (e.key === " " && target?.closest("a, button, summary")) return;
    const forward = e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey);
    const back = e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey);
    if (!forward && !back) return;
    const { start, end } = pin.trigger;
    const y = heading ?? lenis?.targetScroll ?? window.scrollY;
    if (y < start - 2 || y > end + 2) return;
    const from = Math.round(stagePosition((y - start) / Math.max(1, end - start), count));
    const to = from + (forward ? 1 : -1);
    if (to < 0 || to > count - 1) return;
    e.preventDefault();
    jump(to);
  };
  window.addEventListener("keydown", onKey);

  // The pieces drift with a fine pointer by their depth; touch screens leave them still.
  const drift = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    root.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    root.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const fine = matchMedia("(pointer: fine)").matches;
  if (fine) root.addEventListener("pointermove", drift);

  ScrollTrigger.refresh();
  paint(0);

  const stop = () => {
    if (fine) root.removeEventListener("pointermove", drift);
    window.removeEventListener("keydown", onKey);
    window.clearTimeout(wait);
    offWheel?.();
    setWheelGate(null);
    offScroll?.();
    tween.scrollTrigger?.kill(true);
    tween.kill();
    stopSmoothScroll();
    for (const s of stages) {
      for (const prop of ["clip-path", "visibility", "z-index"]) s.slide.style.removeProperty(prop);
      s.slide.inert = false;
      delete s.slide.dataset.shown;
      for (const [el] of s.layers) el.style.transform = "";
    }
    delete root.dataset.mode;
    root.style.removeProperty("--pos");
  };
  return { jump, stop };
}
