import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PATH = "/solutions/access-control";

for (const locale of ["en", "ar"] as const) {
  const path = locale === "ar" ? `/ar${PATH}` : PATH;
  const prefix = locale === "ar" ? "/ar" : "";

  test(`${locale} access control page: 200, one H1, title, canonical, no axe violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    // Audit the finished frame (as smoke.spec.ts does): let the entrance and the door sequence end.
    await page.locator(".t3-door").evaluate((el) => el.scrollIntoView({ block: "center" }));
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

  test(`${locale} access control page: sections link to built pages`, async ({ page, request }) => {
    await page.goto(path);
    // Hero photograph: the hub's access control product, preloaded as the LCP image.
    await expect(page.locator(".t3-hero-photo img")).toHaveAttribute("src", /speedface-v5l-qr/);
    // Door parts: six, each model code linked to its page; every link answers 200.
    const parts = page.locator(".t3-door-parts li");
    await expect(parts).toHaveCount(6);
    const partLinks = page.locator(".t3-door-parts a");
    await expect(partLinks).toHaveCount(6);
    // Method guide: four options, each a filtered access control listing.
    const methods = page.locator(".method-card");
    await expect(methods).toHaveCount(4);
    for (const href of [
      ...(await partLinks.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""))),
      ...(await methods.evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""))),
    ]) {
      expect(href.startsWith(`${prefix}/`)).toBe(true);
      expect((await request.get(href)).status(), href).toBe(200);
    }
    await expect(methods.first()).toHaveAttribute("href", `${prefix}/products/access-control?verify=card`);
    // Six products with Add to quote; both quote actions preset the installation need.
    await expect(page.locator(".pick-card")).toHaveCount(6);
    await expect(
      page.locator(".pick-card").getByRole("button", { name: /Add to quote|أضف إلى عرض السعر/ }),
    ).toHaveCount(6);
    await expect(page.locator(`main a[href="${prefix}/quote?need=install"]`)).toHaveCount(2);
    // Software: ZKAccess 3.5 opens its built page; the others leave for aimsuae.me, marked.
    await expect(page.locator(`.home-software-card[href="${prefix}/software/zkaccess-3-5"]`)).toHaveCount(1);
    await expect(page.locator('.home-software-card[href^="https://aimsuae.me"]')).toHaveCount(2);
  });
}

test("the door reaches its unlocked state without an ongoing timed loop", async ({ page }) => {
  await page.goto(PATH);
  const door = page.locator(".t3-door");
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await expect(door).toHaveAttribute("data-mode", "scroll");
    await door.evaluate((el) => {
      const box = el.getBoundingClientRect();
      scrollTo(0, scrollY + box.top + box.height - innerHeight);
    });
  } else {
    await door.locator(".home-door-drawing").scrollIntoViewIfNeeded();
  }
  await expect(door.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
  await expect
    .poll(
      () => door.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
      { timeout: 6000 },
    )
    .toBe(0);
});

test("reduced motion: the door rests drawn, open and granted, and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  const door = page.locator(".t3-door");
  for (const part of await door.locator(".door-part, .door-card, .door-granted, .door-log").all())
    await expect(part).toHaveCSS("opacity", "1");
  await expect(door.locator(".door-wire").first()).toHaveCSS("stroke-dashoffset", "0px");
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
