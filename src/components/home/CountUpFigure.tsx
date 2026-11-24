"use client";

import { useEffect, useRef } from "react";
import { COUNT_STAGGER_MS, countUpValue, formatFigure } from "@/lib/countUp";

/**
 * One company figure in the proof sentence, counted up from 0 once (CLAUDE.md §3: a tech site's one count). The
 * server render holds the final figure, so crawlers and readers without JS get the real number. Screen readers get
 * only the sr-only final text: the digits on screen are generated content of an aria-hidden box, so no passing number
 * is ever announced. The count starts when 40% of the sentence (`[data-count-group]`) is in view; the box keeps the
 * final figure's width (in em, so it follows the type scale) and the digits are tabular, so nothing shifts. Under
 * reduced motion nothing changes.
 */
export function CountUpFigure({ value, suffix, order }: { value: number; suffix: string; order: number }) {
  const box = useRef<HTMLSpanElement>(null);
  const final = formatFigure(value, suffix);

  useEffect(() => {
    const digits = box.current;
    const group = digits?.closest("[data-count-group]");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!digits || !group || motion.matches) return;
    let frame = 0;
    let cancelled = false;
    const show = (text: string) => {
      digits.dataset.shown = text;
    };
    const finish = () => {
      cancelAnimationFrame(frame);
      show(final);
      digits.style.minInlineSize = "";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now() + order * COUNT_STAGGER_MS;
        const tick = (now: number) => {
          const shown = countUpValue(value, now - start);
          if (shown >= value || motion.matches) return finish();
          show(formatFigure(shown, suffix));
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    // Measured once the real face has loaded, so the reserved width is the final figure's width in that face.
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      const size = parseFloat(getComputedStyle(digits).fontSize);
      digits.style.minInlineSize = `${digits.getBoundingClientRect().width / size}em`;
      show(formatFigure(0, suffix));
      observer.observe(group);
    });
    return () => {
      cancelled = true;
      observer.disconnect();
      finish();
    };
  }, [value, suffix, order, final]);

  return (
    <span className="tabular-nums" dir="ltr">
      <span className="sr-only">{final}</span>
      <span ref={box} className="count-up-digits" aria-hidden="true" data-shown={final} />
    </span>
  );
}
