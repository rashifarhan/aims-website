/*
 * The home families on phones and tablets (DiveMotion loads it lazily; owner review, 28 Nov 2026: scrolling must be
 * smooth on a phone). No pin and no scrub: the hero stands, and the six families sit in one row that the visitor swipes,
 * snapped by CSS (home-dive.css), so the browser scrolls it on its own fast path. This only keeps the arrows, chips and
 * counter in step with the row: no GSAP, no per-frame writes.
 */

export function createDiveCarousel(section: HTMLElement): () => void {
  const row = section.querySelector<HTMLElement>(".dv-slides");
  const slides = [...section.querySelectorAll<HTMLElement>(".dv-slide")];
  const chips = [...section.querySelectorAll<HTMLElement>("[data-dive-go]")];
  const counter = section.querySelector<HTMLElement>(".dv-counter");
  if (!row || slides.length === 0) return () => {};
  const n = slides.length;
  const pad = (i: number) => String(i).padStart(2, "0");
  let active = 0;

  const show = (i: number) => {
    active = i;
    chips.forEach((chip, index) => chip.setAttribute("aria-current", String(index === i)));
    if (counter) counter.textContent = `${pad(i + 1)} / ${pad(n)}`;
  };

  // The row alone moves (never the page), to where the slide's start meets the row's: right in either direction. A
  // scroll to a place, not by a distance, so the snap's stop at every family (for a swipe) lets a chip jump past them.
  const go = (i: number) => {
    const slide = slides[Math.min(n - 1, Math.max(0, i))];
    if (!slide) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = row.scrollLeft + slide.getBoundingClientRect().left - row.getBoundingClientRect().left;
    row.scrollTo({ left, behavior: still ? "auto" : "smooth" });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) show(slides.indexOf(entry.target as HTMLElement));
      }
    },
    { root: row, threshold: 0.6 },
  );
  slides.forEach((slide) => observer.observe(slide));

  const onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLElement>("[data-dive-go], [data-dive-step]");
    if (!button) return;
    const step = button.dataset.diveStep;
    go(step ? active + Number(step) : Number(button.dataset.diveGo));
  };
  section.addEventListener("click", onClick);
  section.dataset.motion = "swipe";
  show(0);

  return () => {
    observer.disconnect();
    section.removeEventListener("click", onClick);
    delete section.dataset.motion;
  };
}
