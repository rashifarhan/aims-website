import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { startSmoothScroll, stopSmoothScroll } from "@/components/motion/smoothScroll";
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

/** Each family's stretch of scroll, as a share of the viewport height (Design rules → Motion). */
const STRETCH = 0.85;
const SETTLE = { duration: 0.8, easing: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2) };

type Stage = { slide: HTMLElement; layers: [HTMLElement, number][] };

/**
 * The family slider's scroll engine (lazy chunk; CLAUDE.md → Design rules → Motion and scroll engine). The section
 * pins and the scroll position drives every frame: the leaving family is covered from its trailing edge on the
 * measured curve while it drifts away, the arriving family's layers come in with parallax, and the scroll settles
 * softly on each family. Lenis smooths the wheel on fine pointers (settle() below settles it); touch screens keep
 * native scroll with ScrollTrigger's scrub smoothing and snap. Only transform and clip-path are written.
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
  // With Lenis, the wheel settles on the family its flick is heading for once the wheel stops (Design rules → Motion:
  // snap only after the scroll stops). Keyboard and scrollbar scrolling settle once the page stands still.
  let wait = 0;
  const settle = () => {
    if (!lenis || !pin.trigger) return;
    const target = settleTarget(lenis.targetScroll, pin.trigger.start, pin.trigger.end, count);
    if (target !== null && Math.abs(target - lenis.targetScroll) > 1)
      lenis.scrollTo(target, { duration: SETTLE.duration, easing: SETTLE.easing });
  };
  const settleLater = (delay: number) => {
    window.clearTimeout(wait);
    wait = window.setTimeout(settle, delay);
  };
  const offWheel = lenis?.on("virtual-scroll", () => settleLater(140));
  // "smooth" is Lenis's own easing (a flick's glide, or a settle under way); anything else is native scrolling.
  const offScroll = lenis?.on("scroll", () => {
    if (lenis.isScrolling !== "smooth") settleLater(220);
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
        : { snapTo: stageSnapPoints(count), duration: { min: 0.3, max: 0.8 }, delay: 0.12, ease: "power3.inOut" },
      onRefresh: () => {
        width = root.querySelector<HTMLElement>(".fam-frame")?.offsetWidth ?? window.innerWidth;
      },
    },
  });
  pin.trigger = tween.scrollTrigger;

  const jump = (index: number) => {
    if (!pin.trigger) return;
    const { start, end } = pin.trigger;
    const k = Math.min(count - 1, Math.max(0, index));
    const top = start + (stageSnapPoints(count)[k] ?? 0) * (end - start);
    if (lenis) lenis.scrollTo(top, { duration: 1.1, easing: SETTLE.easing });
    else window.scrollTo({ top, behavior: "smooth" });
  };

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
    window.clearTimeout(wait);
    offWheel?.();
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
