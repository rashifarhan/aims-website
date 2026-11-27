import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { restMotion } from "./rest";

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
    await restMotion(page);
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

test("WhatsApp on the home page previews before leaving", async ({ page }) => {
  await page.goto("/");
  // Direction 2 drops the floating button: WhatsApp sits with the branches (CLAUDE.md → Design rules, one of each).
  const contact = page.locator("#showrooms").getByRole("link", { name: /WhatsApp/ });
  await contact.scrollIntoViewIfNeeded();
  await contact.click();
  // The site-wide contact preview (ContactGuard): it says nothing was sent and offers the real link.
  const notice = page.getByRole("dialog", { name: /Preview/ });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("Nothing has been sent");
  await expect(notice.getByRole("link", { name: "Open anyway" })).toHaveAttribute("href", /wa.me\/971565240495/);
  await restMotion(page);
  const contactAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(contactAxe.violations.map((violation) => violation.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(notice).toBeHidden();
  await expect(contact).toBeFocused();
});

test("the terminal photo paints whole at once, and the stage rests under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  // The SpeedFace photo is the LCP element: never faded in (it rises with transform only).
  const photo = page.locator("[data-dive-device] img");
  await expect(photo).toHaveCSS("opacity", "1");
  const fades = await page.locator(".dv-rise").evaluate((el) =>
    el
      .getAnimations({ subtree: true })
      .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes())
      .some((frame) => "opacity" in frame),
  );
  expect(fades).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".dv-stage")
        .evaluate(
          (stage) =>
            stage
              .getAnimations({ subtree: true })
              .filter((a) => a.playState === "running" && a.timeline instanceof DocumentTimeline).length,
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
