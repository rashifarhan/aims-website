import type { CSSProperties } from "react";

/** Props that opt an element into the scroll reveal; `i` staggers siblings by 70ms (ScrollEffects). */
export const reveal = (i = 0) => ({
  "data-reveal": "",
  style: { "--reveal-i": i } as CSSProperties,
});
