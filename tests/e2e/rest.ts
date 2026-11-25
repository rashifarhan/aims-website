import type { Page } from "@playwright/test";

/**
 * Put every GSAP sequence (hero, journey, reach map, door kit, section title reveal) at its server-rendered final
 * frame and wait for the CSS transitions that resting starts, so an axe audit reads the colours the page rests on,
 * not a title caught mid-reveal or a colour halfway through a transition. The same switch smoke.spec.ts uses
 * (motion/gsap.ts REST_EVENT).
 */
export async function restMotion(page: Page) {
  await page.evaluate(() => {
    document.documentElement.dataset.motionRest = "true";
    document.dispatchEvent(new Event("aims:motion-rest"));
  });
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
