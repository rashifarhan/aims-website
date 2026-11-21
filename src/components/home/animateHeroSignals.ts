import type { HeroAnimate } from "./heroMotion";

export function animateHeroSignals(root: HTMLElement, animate: HeroAnimate, mobile: boolean) {
  const field = root.querySelector(mobile ? ".home-signals-mobile" : ".home-signals-desktop");
  field?.querySelectorAll<SVGPathElement>("[data-signal]").forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    animate(path, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: 1600,
      delay: 300 + Number(path.dataset.signal) * 45,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
  });
  field?.querySelectorAll<SVGPathElement>("[data-pulse]").forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `46 ${length + 46}`;
    animate(
      path,
      [
        { strokeDashoffset: 46, opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { opacity: 1, offset: 0.85 },
        { strokeDashoffset: -length, opacity: 0 },
      ],
      {
        duration: 2600,
        delay: 1500 + Number(path.dataset.pulse) * 420,
        iterations: Infinity,
        easing: "cubic-bezier(.4,0,.2,1)",
      },
    );
  });
}
