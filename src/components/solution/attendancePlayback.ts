/** A short phone explanation advances only while its drawing can actually be read. */
export function attendancePlayback(stage: Element, show: (step: number) => void): () => void {
  const stages = [650, 1300, 2200];
  let elapsed = 0;
  let started = 0;
  let index = 0;
  let visible = false;
  let running = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    timer = setTimeout(
      () => {
        elapsed += performance.now() - started;
        started = performance.now();
        show(index + 2);
        index += 1;
        if (index < stages.length) schedule();
        else running = false;
      },
      Math.max(0, stages[index] - elapsed),
    );
  };
  const sync = () => {
    if (!visible || document.hidden) {
      if (running) elapsed += performance.now() - started;
      running = false;
      clearTimeout(timer);
    } else if (!running && index < stages.length) {
      running = true;
      started = performance.now();
      schedule();
    }
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      sync();
    },
    { threshold: 0.35 },
  );
  observer.observe(stage);
  document.addEventListener("visibilitychange", sync);
  return () => {
    observer.disconnect();
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", sync);
  };
}
