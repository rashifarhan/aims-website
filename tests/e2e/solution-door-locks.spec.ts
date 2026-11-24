import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PATH = "/solutions/door-locks";

for (const locale of ["en", "ar"] as const) {
  const path = locale === "ar" ? `/ar${PATH}` : PATH;
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} door locks page: 200, one H1, title, canonical, no axe violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    // Audit the finished frame (as smoke.spec.ts does): let the entrance and the unlock sequence end.
    await page.locator(".lk-unlock").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
          .map((a) => (a.timeline instanceof DocumentTimeline ? a.finished.catch(() => undefined) : a.cancel())),
      ),
    );
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${locale} door locks page: sections link to built pages`, async ({ page, request }) => {
    await page.goto(path);
    // Hero photograph: the hub's door lock, preloaded as the LCP image.
    await expect(page.locator(".page-hero-media img")).toHaveAttribute("src", /tl800/);
    // The unlock moment's text equivalent: four steps.
    await expect(page.locator(".lk-steps li")).toHaveCount(4);
    // Door guide: smart and hotel filters, the glass door lock, door hardware; every link answers 200.
    const options = page.locator(".method-card");
    await expect(options).toHaveCount(4);
    const hrefs = await options.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs).toEqual([
      `${prefix}/products/door-locks?type=smart`,
      `${prefix}/product/gl300`,
      `${prefix}/products/door-locks?type=hotel`,
      `${prefix}/products/door-hardware`,
    ]);
    for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
    // Six locks with Add to quote; both quote actions preset the installation need.
    await expect(page.locator(".pick-card")).toHaveCount(6);
    await expect(
      page.locator(".pick-card").getByRole("button", { name: /Add to quote|أضف إلى عرض السعر/ }),
    ).toHaveCount(6);
    await expect(page.locator(`main a[href="${prefix}/quote?need=install"]`)).toHaveCount(2);
    // No software section: the lock software in the specs is not in the software catalogue.
    await expect(page.locator(".home-software-card")).toHaveCount(0);
  });
}

test("the smart lock count matches the listing's smart filter", async ({ page }) => {
  await page.goto(PATH);
  const label = (await page.locator(".method-card").first().locator(".method-count").textContent()) ?? "";
  const count = Number(label.match(/\d+/)?.[0]);
  await page.goto("/products/door-locks?type=smart");
  await expect(page.locator("main")).toContainText(`${count} products`);
});

test("the lock unlocks once when it comes into view", async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
  const moment = page.locator(".lk-unlock");
  await expect(moment).not.toHaveAttribute("data-played");
  await expect(moment.locator(".lk-record")).toHaveCSS("opacity", "0");
  await moment.locator(".lk-drawing").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(moment).toHaveAttribute("data-played", "true");
  await expect(moment.locator(".lk-record")).toHaveCSS("opacity", "1", { timeout: 6000 });
  // It plays once and then stands: nothing in the section keeps running.
  await expect
    .poll(
      () =>
        moment.evaluate(
          (el) =>
            el
              .getAnimations({ subtree: true })
              .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
        ),
      { timeout: 6000 },
    )
    .toBe(0);
});

test("reduced motion: the lock rests unlocked, the door open, and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  const moment = page.locator(".lk-unlock");
  for (const part of await moment.locator(".lk-finger, .lk-led, .lk-record, .lk-tag").all())
    await expect(part).toHaveCSS("opacity", "1");
  for (const line of await moment.locator(".lk-ring, .lk-signal").all())
    await expect(line).toHaveCSS("stroke-dashoffset", "0px");
  await expect(moment.locator(".lk-leaf")).toHaveCSS("transform", /^matrix\(0\.74,/);
  for (const part of await page.locator(".hero-enter, .page-hero-media").all())
    await expect(part).toHaveCSS("opacity", "1");
  expect(
    await page
      .locator("main")
      .evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
      ),
  ).toBe(0);
});

test("phones: no horizontal page scroll, the product row scrolls sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PATH);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator(".pick-row").evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
