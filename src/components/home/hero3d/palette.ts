/**
 * The 3D hero's colours, read from the site's own tokens (globals.css) once on mount, so the scene keeps the
 * brand when a token changes. The fallbacks are the token values at the time of writing.
 */
export type Palette = {
  green: string;
  lime: string;
  night: string;
  white: string;
  clay: string;
  ground: string;
  steel: string;
  pcb: string;
  glass: string;
  screen: string;
  screenOn: string;
};

const FALLBACK: Palette = {
  green: "#26703a",
  lime: "#78be20",
  night: "#0f1f17",
  white: "#ffffff",
  clay: "#e7ece9",
  ground: "#eef6f0",
  steel: "#8a958f",
  pcb: "#1b5e20",
  glass: "#d9ecdf",
  screen: "#eef1ee",
  screenOn: "#d9ecdf",
};

export function readPalette(): Palette {
  if (typeof window === "undefined") return FALLBACK;
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ...FALLBACK,
    green: token("--color-green-700", FALLBACK.green),
    lime: token("--color-lime", FALLBACK.lime),
    night: token("--color-night-900", FALLBACK.night),
    white: token("--color-paper", FALLBACK.white),
    clay: token("--color-paper-3", FALLBACK.clay),
    ground: token("--color-green-50", FALLBACK.ground),
    pcb: token("--color-green-800", FALLBACK.pcb),
    glass: token("--color-green-100", FALLBACK.glass),
    screen: token("--color-paper-3", FALLBACK.screen),
    screenOn: token("--color-green-100", FALLBACK.screenOn),
  };
}
