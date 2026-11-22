import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PATH = "/solutions/pos";

for (const locale of ["en", "ar"] as const) {
  const path = locale === "ar" ? `/ar${PATH}` : PATH;
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} POS page: 200, one H1, title, canonical, no axe violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    // Audit the finished frame (as smoke.spec.ts does): let the entrance and the counter sequence end.
    await page.locator(".pc-counter").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
          .map((a) => a.finished.catch(() => undefined)),
      ),
    );
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${locale} POS page: sections link to built pages`, async ({ page, request }) => {
    await page.goto(path);
    // Hero photograph: the hub's POS terminal, preloaded as the LCP image.
    await expect(page.locator(".t3-hero-photo img")).toHaveAttribute("src", /zkaio1000/);
    // The counter moment's text equivalent: four steps.
    await expect(page.locator(".pc-steps li")).toHaveCount(4);
    // Counter guide: Windows and Android filters, the handheld and the fingerprint terminal; all answer 200.
    const options = page.locator(".method-card");
    await expect(options).toHaveCount(4);
    const hrefs = await options.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs).toEqual([
      `${prefix}/products/pos?type=windows`,
      `${prefix}/products/pos?type=android`,
      `${prefix}/product/zk-h300`,
      `${prefix}/product/zkbio900-series`,
    ]);
    for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
    // Four terminals with Add to quote: not the hero again, never the mistitled zkbio810; both quote actions preset supply.
    await expect(page.locator(".pick-card")).toHaveCount(4);
    await expect(
      page.locator(".pick-card").getByRole("button", { name: /Add to quote|أضف إلى عرض السعر/ }),
    ).toHaveCount(4);
    await expect(page.locator(`.pick-card a[href="${prefix}/product/zkbio810"]`)).toHaveCount(0);
    await expect(page.locator(`main a[href="${prefix}/quote?need=supply"]`)).toHaveCount(2);
    // No software section: the software catalogue holds no POS software.
    await expect(page.locator(".home-software-card")).toHaveCount(0);
  });
}

test("desktop: the 350 px POS photograph is never shown larger than it is", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PATH);
  const box = await page.locator(".t3-hero-photo img").boundingBox();
  expect(box?.width ?? 0).toBeLessThanOrEqual(350);
});

test("the counter verifies and prints once when it comes into view", async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
  const moment = page.locator(".pc-counter");
  await expect(moment).not.toHaveAttribute("data-played");
  await expect(moment.locator(".pc-check")).toHaveCSS("opacity", "0");
  await moment.locator(".pc-drawing").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(moment).toHaveAttribute("data-played", "true");
  await expect(moment.locator(".pc-check")).toHaveCSS("opacity", "1", { timeout: 6000 });
  // At rest the receipt is untransformed; after a fill-mode animation the browser reports the identity matrix.
  await expect(moment.locator(".pc-receipt")).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/, {
    timeout: 6000,
  });
  // It plays once and then stands: nothing in the section keeps running.
  await expect
    .poll(
      () =>
        moment.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
      { timeout: 6000 },
    )
    .toBe(0);
});

test("reduced motion: the counter rests verified with the receipt out, and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  const moment = page.locator(".pc-counter");
  for (const part of await moment.locator(".pc-finger, .pc-check, .pc-sale, .pc-digits").all())
    await expect(part).toHaveCSS("opacity", "1");
  for (const line of await moment.locator(".pc-line, .pc-tick, .pc-wire").all())
    await expect(line).toHaveCSS("stroke-dashoffset", "0px");
  await expect(moment.locator(".pc-receipt")).toHaveCSS("transform", "none");
  for (const part of await page.locator(".t3-enter, .t3-hero-photo").all())
    await expect(part).toHaveCSS("opacity", "1");
  expect(
    await page
      .locator("main")
      .evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
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
