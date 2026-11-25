import { expect, type Locator } from "@playwright/test";

/*
 * The reach map's GSAP sequence (home/reachMotion.ts) is not a CSS animation, so its state is read from what it
 * writes: the routes' stroke-dashoffset, and the hub's opacity (hidden until the map is a third on screen).
 */

/** Everything the sequence moves, as one string: two equal snapshots apart mean the map stands still. */
const snapshot = (map: Locator) =>
  map.evaluate((el) =>
    [...el.querySelectorAll(".reach-route, .reach-office, .reach-ring, .reach-city, .reach-arrive, text")]
      .map((n) => {
        const style = getComputedStyle(n);
        return [style.opacity, style.strokeDashoffset, n.getAttribute("transform") ?? ""].join(",");
      })
      .join("|"),
  );

/** Once GSAP is ready and the map is off screen, the hub waits hidden and every route undrawn. */
export async function expectReachWaiting(map: Locator) {
  await expect(map.locator(".reach-office").first()).toHaveCSS("opacity", "0");
  await expect(map.locator(".reach-route").first()).toHaveCSS("stroke-dashoffset", "1px");
}

/** The map plays out to the finished drawing and then stands: every route drawn, every dot and label whole. */
export async function expectReachFinished(map: Locator) {
  const routes = map.locator(".reach-route");
  for (const route of await routes.all()) await expect(route).toHaveCSS("stroke-dashoffset", "0px", { timeout: 6000 });
  for (const dot of await map.locator(".reach-office, .reach-city").all()) await expect(dot).toHaveCSS("opacity", "1");
  for (const label of await map.locator("text").all()) await expect(label).toHaveCSS("opacity", "1");
  await expect
    .poll(async () => {
      const before = await snapshot(map);
      await map.page().waitForTimeout(400);
      return before === (await snapshot(map));
    })
    .toBe(true);
}

/** Reduced motion and no-JS: the server-rendered finished map, with no GSAP style written onto any part. */
export async function expectReachResting(map: Locator) {
  await expect(map.locator(".reach-route").first()).toBeAttached();
  for (const route of await map.locator(".reach-route").all())
    await expect(route).toHaveCSS("stroke-dashoffset", "0px");
  for (const dot of await map.locator(".reach-office, .reach-city").all()) await expect(dot).toHaveCSS("opacity", "1");
  for (const label of await map.locator("text").all()) await expect(label).toHaveCSS("opacity", "1");
  await expect(map.locator("svg *[style], svg *[transform]")).toHaveCount(0);
}
