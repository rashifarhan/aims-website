import { OPEN, activeIndex, familyProgress } from "@/lib/dive";
import { scrollToY } from "@/components/inside/scrollTo";

/*
 * The home dive on phones and tablets (DiveMotion loads it lazily; owner review, 28 Nov 2026). The motion itself is
 * CSS on a scroll timeline (home-dive.css), run by the browser; this only keeps the counter, chips and focus in step
 * with the family in front, and moves the scroll when an arrow or chip is pressed. It reads the scroll once a frame
 * while scrolling and writes only when the family changes.
 */
export function createDiveScroll(section: HTMLElement): () => void {
  const slides = [...section.querySelectorAll<HTMLElement>(".dv-slide")];
  const chips = [...section.querySelectorAll<HTMLElement>("[data-dive-go]")];
  const counter = section.querySelector<HTMLElement>(".dv-counter");
  const n = slides.length;
  if (n === 0) return () => {};
  const pad = (i: number) => String(i).padStart(2, "0");
  let box = { start: 0, length: 1 };
  let shown = -1;
  let frame = 0;

  // Where the section's scroll starts (its top under the header) and how far it runs, as the view timeline has it.
  const measure = () => {
    const header = document.querySelector("header")?.offsetHeight ?? 0;
    const start = section.getBoundingClientRect().top + scrollY - header;
    box = { start, length: Math.max(1, section.offsetHeight - (innerHeight - header)) };
  };
  const progress = () => Math.min(1, Math.max(0, (scrollY - box.start) / box.length));

  const show = (i: number) => {
    if (i === shown) return;
    shown = i;
    slides.forEach((slide, index) => slide.toggleAttribute("inert", index !== i));
    chips.forEach((chip, index) => chip.setAttribute("aria-current", String(index === i)));
    if (counter) counter.textContent = `${pad(i + 1)} / ${pad(n)}`;
  };
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const p = progress();
      section.toggleAttribute("data-inside", p > (OPEN[0] + OPEN[1]) / 2);
      show(activeIndex(p, n));
    });
  };
  const go = (i: number) => {
    const to = familyProgress(Math.min(n - 1, Math.max(0, i)), n);
    scrollToY(box.start + to * box.length);
  };

  const onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLElement>("[data-dive-go], [data-dive-step]");
    if (!button) return;
    const step = button.dataset.diveStep;
    go(step ? shown + Number(step) : Number(button.dataset.diveGo));
  };
  // Tabbing into the families before the screen has opened brings the first one in front.
  const onFocus = (event: FocusEvent) => {
    if ((event.target as Element).closest(".dv-inside") && progress() < familyProgress(0, n) - 0.01) go(0);
  };
  const onResize = () => {
    measure();
    update();
  };

  measure();
  update();
  section.dataset.motion = "scroll";
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", onResize);
  section.addEventListener("click", onClick);
  section.addEventListener("focusin", onFocus);
  const observer = new ResizeObserver(onResize);
  observer.observe(document.body);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    removeEventListener("scroll", update);
    removeEventListener("resize", onResize);
    section.removeEventListener("click", onClick);
    section.removeEventListener("focusin", onFocus);
    slides.forEach((slide) => slide.removeAttribute("inert"));
    section.removeAttribute("data-inside");
    delete section.dataset.motion;
  };
}
