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
    // Audit the finished frame (as smoke.spec.ts does): let the entrance end, then put the door at rest. The door is
    // a GSAP sequence (solution/access-control/doorMotion.ts), which the motion's rest switch reverts to the
    // server-rendered finished frame; wait until no finite CSS animation is still running.
    const door = page.locator(".t3-door");
    await expect(door).toHaveAttribute("data-motion", /pinned|flow/);
    await door.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.evaluate(() => {
      document.documentElement.dataset.motionRest = "true";
      document.dispatchEvent(new Event("aims:motion-rest"));
    });
    await expect(door).not.toHaveAttribute("data-motion");
    await expect(door.locator(".door-granted")).toHaveCSS("opacity", "1");
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document
                .getAnimations()
                .filter(
                  (a) =>
                    a.playState === "running" &&
                    a.timeline instanceof DocumentTimeline &&
                    Number.isFinite(a.effect?.getTiming().iterations),
                ).length,
          ),
        { timeout: 8000 },
      )
      .toBe(0);
    // Scroll reveals rest whole once read: audit that resting text, not a block half-faded at the fold.
    await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => !(animation.timeline instanceof DocumentTimeline))
        .forEach((animation) => animation.cancel()),
    );
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${locale} access control page: sections link to built pages`, async ({ page, request }) => {
    await page.goto(path);
    // Hero photograph: the hub's access control product, preloaded as the LCP image.
    await expect(page.locator(".page-hero-media img")).toHaveAttribute("src", /speedface-v5l-qr/);
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
    // Software: ZKBio CVAccess and CVSecurity open their built pages (ZKAccess 3.5 is retired).
    for (const slug of ["zkbio-cvaccess", "zkbio-cvsecurity"])
      await expect(page.locator(`.home-software-card[href="${prefix}/software/${slug}"]`)).toHaveCount(1);
    await expect(page.locator('.home-software-card[href^="https://aimsuae.me"]')).toHaveCount(0);
  });
}

test("the door reaches its unlocked, verified state and then stands still", async ({ page }) => {
  await page.goto(PATH);
  const door = page.locator(".t3-door");
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await expect(door).toHaveAttribute("data-motion", "pinned");
    // The end of the pin: the spacer's foot reaches the viewport's foot.
    await door.evaluate((el) => {
      const spacer = el.querySelector(".pin-spacer");
      if (!spacer) throw new Error("the desktop door pins its content");
      const box = spacer.getBoundingClientRect();
      scrollTo(0, scrollY + box.bottom - innerHeight + 10);
    });
  } else {
    await expect(door).toHaveAttribute("data-motion", "flow");
    await door.locator(".home-door-drawing").evaluate((el) => el.scrollIntoView({ block: "start" }));
  }
  await expect(door.locator(".door-granted")).toHaveCSS("opacity", "1", { timeout: 6000 });
  // Verified: no part singled out, the tick drawn, and no timed loop: the drawing holds still once there.
  await expect(door).toHaveAttribute("data-step", "done", { timeout: 6000 });
  await expect(door.locator("[data-door-step][aria-current]")).toHaveCount(0);
  const frame = () =>
    door.evaluate((el) =>
      [...el.querySelectorAll(".door-leaf, .door-card, .door-verified path, .door-pulse")]
        .map(
          (part) => `${part.getAttribute("transform")}|${getComputedStyle(part).opacity}|${part.getAttribute("style")}`,
        )
        .join(";"),
    );
  await page.waitForTimeout(1500);
  const settled = await frame();
  await page.waitForTimeout(1000);
  expect(await frame()).toBe(settled);
  await expect(door.locator(".door-leaf")).toHaveAttribute("transform", /matrix\(0\.74,0,0,1,0,0\)/);
});

test("reduced motion: the door rests drawn, open and granted, and nothing moves", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  const door = page.locator(".t3-door");
  for (const part of await door.locator(".door-part, .door-card, .door-granted, .door-log").all())
    await expect(part).toHaveCSS("opacity", "1");
  await expect(door.locator(".door-wire").first()).toHaveCSS("stroke-dashoffset", "0px");
  // No GSAP: no mode, no pin, no inline styles; the leaf stands open and the verified tick is whole.
  await expect(door).not.toHaveAttribute("data-motion");
  await expect(door.locator(".pin-spacer")).toHaveCount(0);
  await expect(door.locator(".door-leaf")).toHaveAttribute("transform", "scale(0.74 1)");
  for (const part of await door.locator(".door-trail, .door-verified path, .door-part").all())
    expect(await part.getAttribute("style")).toBeNull();
  await expect(door.locator(".door-pulse").first()).toHaveCSS("opacity", "0");
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
