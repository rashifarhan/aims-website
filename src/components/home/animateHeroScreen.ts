import { HERO_CYCLE as cycle, type HeroAnimate } from "./heroMotion";

/** Approved prototype: scan at 1.9s, verified at 3.4s, idle at 6.2s; 450ms state fades. */
export function animateHeroScreen(root: HTMLElement, animate: HeroAnimate) {
  const loop = { duration: cycle, delay: 1900, iterations: Infinity };
  const times = [0, 450, 1500, 1950, 4300, 4750, cycle];
  const light = root.querySelector(".home-wash-verified");
  if (light)
    animate(
      light,
      [0, 0, 0, 1, 1, 0, 0].map((opacity, i) => ({ opacity, offset: times[i] / cycle })),
      loop,
    );
  root.querySelectorAll<HTMLElement>("[data-screen]").forEach((screen) => {
    const values =
      screen.dataset.screen === "idle"
        ? [1, 0, 0, 0, 0, 1, 1]
        : screen.dataset.screen === "scan"
          ? [0, 1, 1, 0, 0, 0, 0]
          : [0, 0, 0, 1, 1, 0, 0];
    animate(
      screen,
      values.map((opacity, i) => ({ opacity, transform: `scale(${opacity ? 1 : 0.98})`, offset: times[i] / cycle })),
      loop,
    );
  });
  const beam = root.querySelector("[data-beam]");
  if (beam)
    animate(beam, [{ transform: "translateY(0)" }, { transform: "translateY(500%)" }], {
      duration: 1200,
      direction: "alternate",
      iterations: Infinity,
      easing: "cubic-bezier(.45,0,.55,1)",
    });
  const circle = root.querySelector(".home-device-tick");
  if (circle)
    animate(
      circle,
      [
        { transform: "scale(.6)", offset: 0 },
        { transform: "scale(.6)", offset: 1500 / cycle, easing: "cubic-bezier(.2,1.4,.4,1)" },
        { transform: "scale(1)", offset: 2000 / cycle },
        { transform: "scale(1)", offset: 4300 / cycle },
        { transform: "scale(.6)", offset: 4750 / cycle },
        { transform: "scale(.6)" },
      ],
      loop,
    );
  const tick = root.querySelector<SVGPathElement>(".home-device-tick path");
  if (tick) {
    const length = tick.getTotalLength();
    tick.style.strokeDasharray = String(length);
    animate(
      tick,
      [
        { strokeDashoffset: length, offset: 0 },
        { strokeDashoffset: length, offset: 1650 / cycle, easing: "ease-out" },
        { strokeDashoffset: 0, offset: 2150 / cycle },
        { strokeDashoffset: 0, offset: 4300 / cycle },
        { strokeDashoffset: length, offset: 4750 / cycle },
        { strokeDashoffset: length },
      ],
      loop,
    );
  }
}
