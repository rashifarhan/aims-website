import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { restMotion } from "./rest";

const PATH = "/solutions/entrance-parking";

for (const locale of ["en", "ar"] as const) {
  const path = locale === "ar" ? `/ar${PATH}` : PATH;
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} entrance and parking page: 200, one H1, title, canonical, no axe violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    // Audit the finished frame (as smoke.spec.ts does): let the entrance and the lanes sequence end.
    await page.locator(".ep-lanes").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
          .map((a) => (a.timeline instanceof DocumentTimeline ? a.finished.catch(() => undefined) : a.cancel())),
      ),
    );
    await restMotion(page);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${locale} entrance and parking page: sections link to built pages`, async ({ page, request }) => {
    await page.goto(path);
    // Hero photograph: the hub's entrance and parking product, preloaded as the LCP image.
    await expect(page.locator(".page-hero-media img")).toHaveAttribute("src", /barrier-gates-bgm-1045/);
    // Lanes moment: a labelled drawing and its four steps as the text equivalent.
    await expect(page.locator(".ep-lanes svg[role=img]")).toHaveAttribute("aria-label", /.+/);
    await expect(page.locator(".ep-steps li")).toHaveCount(4);
    // Lane options: four cards, two model chips each, and the listing's two type filters.
    await expect(page.locator(".ep-option")).toHaveCount(4);
    const chips = page.locator(".ep-chip");
    await expect(chips).toHaveCount(8);
    const filters = page.locator(".ep-option-links a");
    await expect(filters).toHaveCount(2);
    await expect(filters.nth(0)).toHaveAttribute("href", `${prefix}/products/entrance-control?type=pedestrian`);
    await expect(filters.nth(1)).toHaveAttribute("href", `${prefix}/products/entrance-control?type=parking`);
    for (const href of [
      ...(await chips.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""))),
      ...(await filters.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""))),
    ]) {
      expect(href.startsWith(`${prefix}/`)).toBe(true);
      expect((await request.get(href)).status(), href).toBe(200);
    }
    // The filter links carry the listing's own counts (22 pedestrian, 7 parking in today's import).
    await expect(filters.nth(0)).toContainText(/\d+/);
    await expect(filters.nth(1)).toContainText(/\d+/);
    // Six products with Add to quote; both quote actions preset the installation need.
    await expect(page.locator(".pick-card")).toHaveCount(6);
    await expect(
      page.locator(".pick-card").getByRole("button", { name: /Add to quote|أضف إلى عرض السعر/ }),
    ).toHaveCount(6);
    await expect(page.locator(`main a[href="${prefix}/quote?need=install"]`)).toHaveCount(2);
    // Software: the two platforms that name parking; each opens a built page or AIMS's own page.
    const software = page.locator(".home-software-card");
    await expect(software).toHaveCount(2);
    for (const href of await software.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? "")))
      expect(href.startsWith(`${prefix}/software/`) || href.startsWith("https://aimsuae.me")).toBe(true);
    await expect(page.locator(".ui-faq details")).toHaveCount(5);
  });
}

test("the lanes play once when they come into view", async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator("html")).toHaveAttribute("data-effects", "on");
  const lanes = page.locator(".ep-lanes");
  await expect(lanes).not.toHaveAttribute("data-played");
  await expect(lanes.locator(".ep-granted")).toHaveCSS("opacity", "0");
  await lanes.locator(".ep-drawing").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(lanes).toHaveAttribute("data-played", "true");
  await expect(lanes.locator(".ep-plate")).toHaveCSS("opacity", "1", { timeout: 6000 });
  // It plays once and then stands: nothing in the section keeps running.
  await expect
    .poll(
      () =>
        lanes.evaluate(
          (el) =>
            el
              .getAnimations({ subtree: true })
              .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
        ),
      { timeout: 6000 },
    )
    .toBe(0);
});

test("reduced motion: the lanes rest drawn, open and read, and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  const lanes = page.locator(".ep-lanes");
  for (const part of await lanes.locator(".ep-card, .ep-granted, .ep-led, .ep-car, .ep-plate").all())
    await expect(part).toHaveCSS("opacity", "1");
  for (const wire of await lanes.locator(".ep-wire, .ep-tick").all())
    await expect(wire).toHaveCSS("stroke-dashoffset", "0px");
  // The boom is up and the panels are open (their final transforms, not the closed state).
  await expect(lanes.locator(".ep-boom")).not.toHaveCSS("transform", "none");
  await expect(lanes.locator(".ep-panel").first()).not.toHaveCSS("transform", "none");
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
  // Phones stack heading, drawing, then steps: the drawing is in view while it plays.
  const [stage, steps] = await Promise.all([
    page.locator(".ep-lanes-stage").boundingBox(),
    page.locator(".ep-steps").boundingBox(),
  ]);
  expect(stage && steps && stage.y < steps.y).toBe(true);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
