import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en", "ar"] as const) {
  test(`${locale} header suggestions support keyboard selection`, async ({ page, isMobile }, testInfo) => {
    await page.goto(locale === "en" ? "/" : "/ar");
    if (isMobile) {
      await page.getByRole("button", { name: locale === "en" ? "Open menu" : "فتح القائمة" }).click();
      await expect(page.locator("dialog .tracking-wordmark")).toHaveCSS("direction", "ltr");
    }
    const input = page.locator(isMobile ? "#mobile-search" : "#header-search");
    await input.fill("zkteco");
    await expect(page.getByRole("option")).toHaveCount(6);
    await input.press("ArrowUp");
    await expect(input).toHaveAttribute("aria-activedescendant", /-option-5$/);
    await expect
      .poll(async () => {
        const option = await page.getByRole("option").last().boundingBox();
        const list = await page.getByRole("listbox").boundingBox();
        return !!option && !!list && option.y >= list.y && option.y + option.height <= list.y + list.height;
      })
      .toBe(true);
    await input.fill("sa20");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("option").first()).toContainText("SA20");
    await expect(page.getByRole("option").first().locator("strong")).toContainText(/sa20/i);
    const suggestionsAxe = await new AxeBuilder({ page })
      .include(isMobile ? "dialog[open]" : "header")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(suggestionsAxe.violations.map((violation) => violation.id)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("suggestions.png") });
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", /-option-0$/);
    await input.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${locale === "ar" ? "/ar" : ""}/product/bio-pro-sa20$`));
  });
}

test("WhatsApp stays out of the first screen and previews before leaving", async ({ page }) => {
  await page.goto("/");
  const contact = page.getByRole("button", { name: "Chat on WhatsApp" });
  await expect(contact).toBeHidden();
  await page.locator("#families").scrollIntoViewIfNeeded();
  await expect(contact).toBeVisible();
  await contact.click();
  const notice = page.getByRole("dialog", { name: "Preview contact" });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("Nothing has been sent to AIMS");
  await expect(notice.getByRole("link", { name: /Open WhatsApp/ })).toHaveAttribute("href", /wa.me\/971565240495/);
  const contactAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(contactAxe.violations.map((violation) => violation.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(notice).toBeHidden();
  await expect(contact).toBeFocused();
});

test("approved hero entrances and verification tick settle under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const hero = page.locator(".home-hero");
  await expect(page.locator("[data-hero-animation]")).toHaveAttribute("data-state", "animated");
  const entrance = await page
    .locator(".home-device")
    .evaluate((element) => element.getAnimations().map((animation) => animation.effect?.getTiming()));
  // Approved redesign: the entire entrance settles within 1.1s, including its overlap delay.
  expect(entrance.length).toBeGreaterThan(0);
  expect(
    entrance.every(
      (timing) =>
        timing !== undefined &&
        typeof timing.duration === "number" &&
        timing.duration + (timing.delay ?? 0) <= 1100 &&
        timing.iterations === 1,
    ),
  ).toBe(true);
  const tick = page.locator(".home-device-tick path");
  await tick.evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = 1900 + 1750;
    }
  });
  const drawing = await tick.evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeDashoffset));
  expect(drawing).toBeGreaterThan(0);
  await tick.evaluate((element) => {
    for (const animation of element.getAnimations()) animation.currentTime = 1900 + 2400;
  });
  await expect(tick).toHaveCSS("stroke-dashoffset", "0px");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-screen="verified"]')).toHaveCSS("opacity", "1");
  await expect(tick).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator(".home-headline-rise").first()).toHaveCSS("transform", "none");
  await expect
    .poll(() =>
      hero.evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === "running" && animation.timeline instanceof DocumentTimeline)
            .length,
      ),
    )
    .toBe(0);
});

test("menu exposes its state and moves keyboard focus", async ({ page, isMobile }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: isMobile ? "Open menu" : "Products", exact: true });
  await trigger.focus();
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  if (!isMobile) {
    // WAI-ARIA disclosure (README, "Interaction layer"): focus stays on the button; Tab reaches the panel next.
    const panel = page.locator(`[id="${await trigger.getAttribute("aria-controls")}"]`);
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("link").first()).toBeFocused();
  } else await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
