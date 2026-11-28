/**
 * The family slider on touch screens (CLAUDE.md → Design rules → Motion; owner, 28 Nov 2026: the pinned scroll did
 * not perform on phones). Nothing pins and nothing takes over the page's scroll: the hero is one screen, and the six
 * floods sit side by side in a native scroll-snap carousel, one family per swipe. Scrolling runs on the browser's
 * own thread; this reads where the carousel is once a frame, moves each flood's layers by their depth (only
 * transform), keeps the hidden families inert and moves the carousel for the tabs, arrows and keys. No GSAP and no
 * Lenis load for it.
 */
/** How far each layer drifts past its flood during a swipe, as a share of the screen width: the deeper the layer, the
 * further (the pinned stage's LAYER_TRAVEL, halved for a phone's narrow screen). */
const SWIPE_TRAVEL: Record<string, number> = { word: 0.22, shadow: 0.16, hero: 0.07, bits: 0.3, corner: 0.42 };

export function startSwipe(root: HTMLElement, onShown: (index: number) => void) {
  const track = root.querySelector<HTMLElement>(".fam-slides");
  const slides = [...root.querySelectorAll<HTMLElement>(".fam-slide")];
  if (!track || !slides.length) return null;
  const count = slides.length;
  const layers = slides.map((s) =>
    [...s.querySelectorAll<HTMLElement>("[data-layer]")].map(
      (el) => [el, SWIPE_TRAVEL[el.dataset.layer ?? ""] ?? 0] as const,
    ),
  );
  const sign = getComputedStyle(root).direction === "rtl" ? -1 : 1;
  let shown = -1;
  let frame = 0;

  root.dataset.mode = "swipe";

  const read = () => {
    frame = 0;
    // scrollLeft runs negative in a right-to-left carousel; the distance from the first family is what counts.
    const width = Math.max(1, track.clientWidth);
    const position = Math.abs(track.scrollLeft) / width;
    root.style.setProperty("--pos", position.toFixed(3));
    // A flood one place away from the screen has its layers at the full drift, so it arrives already in motion.
    layers.forEach((set, k) => {
      const offset = Math.max(-1, Math.min(1, k - position));
      for (const [el, travel] of set)
        el.style.transform = offset ? `translate3d(${sign * offset * travel * width}px,0,0)` : "";
    });
    const next = Math.min(count - 1, Math.max(0, Math.round(position)));
    if (next === shown) return;
    shown = next;
    slides.forEach((s, k) => {
      s.inert = k !== shown;
      s.dataset.shown = String(k === shown);
    });
    onShown(shown);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(read);
  };
  track.addEventListener("scroll", onScroll, { passive: true });
  // A rotation or the address bar changes the width the drift is measured in.
  const resize = new ResizeObserver(onScroll);
  resize.observe(track);
  read();

  const jump = (index: number) => {
    const k = Math.min(count - 1, Math.max(0, index));
    track.scrollTo({ left: sign * k * track.clientWidth, behavior: "smooth" });
  };

  const stop = () => {
    track.removeEventListener("scroll", onScroll);
    resize.disconnect();
    cancelAnimationFrame(frame);
    track.scrollLeft = 0;
    for (const set of layers) for (const [el] of set) el.style.transform = "";
    for (const s of slides) {
      s.inert = false;
      delete s.dataset.shown;
    }
    delete root.dataset.mode;
    root.style.removeProperty("--pos");
  };
  return { jump, stop };
}
