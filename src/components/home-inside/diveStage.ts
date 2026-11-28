import { DIVE, OPEN, activeIndex, ramp, slideOffset, slideOpacity, zoom } from "@/lib/dive";

/*
 * The DOM side of the home dive (DiveMotion loads it lazily). `render(p)` writes one frame: the terminal's transform,
 * the stage's custom properties, each family's offset and opacity, and which family is in front. Only transform,
 * opacity and clip-path change (CLAUDE.md → Design rules, Motion).
 */

/** The SpeedFace's screen inside its photograph, as fractions of the cut-out (public/images/cutouts/speedface-v5l). */
const SCREEN = { x: 0.136, y: 0.199, w: 0.708, h: 0.579 };

export type DiveStage = {
  measure: () => void;
  render: (p: number) => void;
  active: () => number;
  clear: () => void;
};

export function createDiveStage(section: HTMLElement): DiveStage | null {
  const stage = section.querySelector<HTMLElement>(".dv-stage");
  const rise = section.querySelector<HTMLElement>(".dv-rise");
  const device = section.querySelector<HTMLElement>("[data-dive-device]");
  const slides = [...section.querySelectorAll<HTMLElement>(".dv-slide")];
  const chips = [...section.querySelectorAll<HTMLElement>("[data-dive-go]")];
  const counter = section.querySelector<HTMLElement>(".dv-counter");
  if (!stage || !rise || !device || slides.length === 0) return null;
  const n = slides.length;
  const total = String(n).padStart(2, "0");
  let geo = { tx: 0, ty: 0, k: 1, inset: [0, 0, 0, 0] };
  let shown = -1;
  // What was last written, so a frame that changes nothing writes nothing: every custom property set restyles the
  // section, and the scrub runs for a while after the scroll has stopped.
  const written = new Map<string, string>();
  const write = (el: HTMLElement, key: string, name: string, value: string) => {
    if (written.get(key) === value) return;
    written.set(key, value);
    if (name === "transform") el.style.transform = value;
    else el.style.setProperty(name, value);
  };

  // Layout boxes (offsets ignore transforms, so the entrance and the dive itself never skew the measurement): the
  // scale at which the screen fills the stage's height, and where that enlarged screen sits, which is where the
  // families start to open from.
  const measure = () => {
    const sw = rise.offsetWidth * SCREEN.w;
    const sh = rise.offsetHeight * SCREEN.h;
    const ox = rise.offsetWidth * (SCREEN.x + SCREEN.w / 2);
    const oy = rise.offsetHeight * (SCREEN.y + SCREEN.h / 2);
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const k = (H * 0.94) / sh;
    const fx = Math.max(0, (W - sw * k) / 2);
    const fy = Math.max(0, (H - sh * k) / 2);
    geo = { tx: W / 2 - (rise.offsetLeft + ox), ty: H / 2 - (rise.offsetTop + oy), k, inset: [fy, fx, fy, fx] };
    device.style.transformOrigin = `${ox}px ${oy}px`;
  };

  const setActive = (i: number) => {
    if (i === shown) return;
    shown = i;
    slides.forEach((slide, index) => slide.toggleAttribute("inert", index !== i));
    chips.forEach((chip, index) => chip.setAttribute("aria-current", String(index === i)));
    if (counter) counter.textContent = `${String(i + 1).padStart(2, "0")} / ${total}`;
  };

  const render = (p: number) => {
    const d = ramp(p, DIVE);
    const m = 1 - (1 - d) ** 3;
    write(
      device,
      "t",
      "transform",
      `translate3d(${(geo.tx * m).toFixed(2)}px, ${(geo.ty * m).toFixed(2)}px, 0) scale(${zoom(d, geo.k).toFixed(4)}) rotate(${(-4 * (1 - m)).toFixed(3)}deg)`,
    );
    const o = ramp(p, OPEN);
    const g = 1 - (1 - o) ** 3;
    const [t, r, b, l] = geo.inset.map((v) => (v * (1 - g)).toFixed(1));
    write(section, "--dive", "--dive", d.toFixed(4));
    write(section, "--open", "--open", o.toFixed(4));
    // Fully shut until the screen starts to open: the families never show through the terminal on its way in.
    const clip = o > 0 ? `inset(${t}px ${r}px ${b}px ${l}px round ${(14 * (1 - g)).toFixed(1)}px)` : "inset(50%)";
    write(section, "--clip", "--clip", clip);
    write(section, "--reel", "--reel", Math.min(1, Math.max(0, (p - OPEN[1]) / (1 - OPEN[1]))).toFixed(4));
    section.toggleAttribute("data-opening", o > 0);
    section.toggleAttribute("data-inside", o > 0.5);
    slides.forEach((slide, index) => {
      const x = slideOffset(p, n, index);
      write(slide, `x${index}`, "--x", x.toFixed(4));
      write(slide, `o${index}`, "--o", slideOpacity(x).toFixed(3));
    });
    setActive(activeIndex(p, n));
  };

  const clear = () => {
    device.style.removeProperty("transform");
    device.style.removeProperty("transform-origin");
    for (const name of ["--dive", "--open", "--clip", "--reel"]) section.style.removeProperty(name);
    section.removeAttribute("data-opening");
    section.removeAttribute("data-inside");
    slides.forEach((slide) => {
      slide.removeAttribute("inert");
      slide.style.removeProperty("--x");
      slide.style.removeProperty("--o");
    });
    shown = -1;
    written.clear();
  };

  return { measure, render, active: () => Math.max(0, shown), clear };
}
