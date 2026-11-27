import { useEffect, type RefObject } from "react";

/**
 * While a flood sits under the sticky header, the header goes transparent with white text (CLAUDE.md → Design rules →
 * Layout). The server renders the watched element with `data-tone="ground"` (the stage opens the page); this keeps the
 * attribute in step with the scroll, and families.css reads it. The watched line is the header's own band at the top
 * of the viewport.
 */
export function useHeaderTone(target: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.tone = entry?.isIntersecting ? "ground" : "page";
      },
      { rootMargin: "0px 0px -92% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
}
