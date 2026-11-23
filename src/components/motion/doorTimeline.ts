/** Design Doc 8.2: approved geometry and parts order, driven by a single reversible clock. */
export function doorTimeline(root: HTMLElement): Animation[] {
  const animations: Animation[] = [];
  const easing = getComputedStyle(root).getPropertyValue("--ease-aims").trim();
  const add = (selector: string, from: Keyframe, to: Keyframe, start: number, end: number) => {
    root.querySelectorAll(selector).forEach((element) => {
      const animation = element.animate(
        [
          { ...from, offset: 0 },
          { ...from, offset: start, easing },
          { ...to, offset: end },
          { ...to, offset: 1 },
        ],
        { duration: 1000, fill: "both" },
      );
      animation.pause();
      animations.push(animation);
    });
  };
  const enter = (selector: string, start: number, end: number) =>
    add(selector, { opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }, start, end);
  enter(".door-controller", 0.14, 0.26);
  add(".door-wires", { opacity: 0 }, { opacity: 1 }, 0.18, 0.2);
  root.querySelectorAll(".door-wires .door-wire").forEach((wire, index) => {
    wire.setAttribute("data-door-wire", String(index));
    add(
      `[data-door-wire="${index}"]`,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0 },
      0.2 + index * 0.12,
      0.34 + index * 0.12,
    );
  });
  enter(".door-lock", 0.34, 0.45);
  enter(".door-exit", 0.5, 0.61);
  add(
    ".door-card",
    { opacity: 0, transform: "translate(-150px, 70px) rotate(-14deg)" },
    { opacity: 1, transform: "none" },
    0.64,
    0.77,
  );
  add(".door-led", { opacity: 0 }, { opacity: 1 }, 0.76, 0.8);
  add(".door-leaf", { transform: "scaleX(1)" }, { transform: "scaleX(.74)" }, 0.79, 0.89);
  add(".door-granted", { opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }, 0.86, 0.92);
  enter(".door-software", 0.87, 0.95);
  add(".door-software .door-wire", { strokeDashoffset: 1 }, { strokeDashoffset: 0 }, 0.88, 0.97);
  enter(".door-log", 0.95, 1);
  return animations;
}
