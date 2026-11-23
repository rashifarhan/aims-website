/** A collapsed/short scene has no scroll journey: show its complete, usable drawing. */
export function storyProgress(top: number, height: number, viewport: number): number {
  const range = height - viewport;
  return range <= 0 ? 1 : Math.max(0, Math.min(1, -top / range));
}

export function storyStep(progress: number, count: number): number {
  return Math.max(1, Math.min(count, Math.floor(progress * count) + 1));
}
