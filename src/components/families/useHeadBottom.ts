import { useEffect, type RefObject } from "react";

/**
 * Where the stage's headline block ends, as `--head-bottom` on the stage (families.css, phones): the product is drawn
 * below it, so a headline that wraps to four lines at 320px, or an Arabic one, never runs into the product.
 */
export function useHeadBottom(root: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const el = root.current;
    const head = el?.querySelector<HTMLElement>(".fam-head");
    if (!el || !head || !on) return;
    const set = () => el.style.setProperty("--head-bottom", `${head.offsetTop + head.offsetHeight + 12}px`);
    const observer = new ResizeObserver(set);
    observer.observe(head);
    set();
    return () => {
      observer.disconnect();
      el.style.removeProperty("--head-bottom");
    };
  }, [root, on]);
}
