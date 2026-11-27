import { ramp, zoom } from "@/lib/dive";
import { STAGE_DIVE, STAGE_OPEN, apertureFit, type Aperture } from "@/lib/stageDive";

/*
 * The DOM side of a page stage's dive (StageMotion loads it lazily). `render(p)` writes one frame: the product's
 * transform and the section's --dive, --open and --clip. Only transform, opacity and clip-path change (CLAUDE.md →
 * Design rules, Motion).
 */
export function createStageWriter(section: HTMLElement, screen: Aperture) {
  const stage = section.querySelector<HTMLElement>(".ps-stage");
  const rise = section.querySelector<HTMLElement>(".ps-rise");
  const device = section.querySelector<HTMLElement>(".ps-device");
  if (!stage || !rise || !device) return null;
  let geo = { tx: 0, ty: 0, k: 1, inset: [0, 0, 0, 0] as readonly number[] };

  // Layout boxes (offsets ignore transforms): the scale at which the screen fills the stage, and the enlarged
  // screen's box, which is where the inside starts to open from.
  const measure = () => {
    const sw = rise.offsetWidth * screen.w;
    const sh = rise.offsetHeight * screen.h;
    const ox = rise.offsetWidth * (screen.x + screen.w / 2);
    const oy = rise.offsetHeight * (screen.y + screen.h / 2);
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const { k, inset } = apertureFit(sw, sh, W, H);
    geo = { tx: W / 2 - (rise.offsetLeft + ox), ty: H / 2 - (rise.offsetTop + oy), k, inset };
    device.style.transformOrigin = `${ox}px ${oy}px`;
  };

  const render = (p: number) => {
    const d = ramp(p, STAGE_DIVE);
    const m = 1 - (1 - d) ** 3;
    device.style.transform = `translate3d(${(geo.tx * m).toFixed(2)}px, ${(geo.ty * m).toFixed(2)}px, 0) scale(${zoom(d, geo.k).toFixed(4)})`;
    const o = ramp(p, STAGE_OPEN);
    const g = 1 - (1 - o) ** 3;
    const [t, r, b, l] = geo.inset.map((v) => (v * (1 - g)).toFixed(1));
    section.style.setProperty("--dive", d.toFixed(4));
    section.style.setProperty("--open", o.toFixed(4));
    // Shut until the screen starts to open, so the inside never shows through the product on its way in.
    section.style.setProperty(
      "--clip",
      o > 0 ? `inset(${t}px ${r}px ${b}px ${l}px round ${(14 * (1 - g)).toFixed(1)}px)` : "inset(50%)",
    );
    section.toggleAttribute("data-inside", o > 0.5);
  };

  const clear = () => {
    device.style.removeProperty("transform");
    device.style.removeProperty("transform-origin");
    for (const name of ["--dive", "--open", "--clip"]) section.style.removeProperty(name);
    section.removeAttribute("data-inside");
  };

  return { measure, render, clear };
}
