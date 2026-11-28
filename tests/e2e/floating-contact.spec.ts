import { expect, test, type Page } from "@playwright/test";

// WhatsApp and Call in the corner on every page (owner request, 28 Nov 2026). Design Doc 6: never in the first
// screen; it steps aside at the footer and on Contact, and in the preview its links open the notice first.
const dock = (page: Page) => page.getByRole("group", { name: "Contact AIMS" });
const scrollTo = (page: Page, y: number | "end") =>
  page.evaluate(
    (to) => window.scrollTo({ top: to === "end" ? document.body.scrollHeight : to, behavior: "instant" }),
    y,
  );

test("comes in after the first screen and steps aside at the footer", async ({ page }) => {
  await page.goto("/solutions/time-attendance", { waitUntil: "load" });
  await expect(dock(page)).toBeHidden();
  const height = page.viewportSize()?.height ?? 800;
  await scrollTo(page, height * 1.5);
  await expect(dock(page)).toBeVisible();
  await expect(dock(page).getByRole("link", { name: "Chat with AIMS on WhatsApp" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/971565240495/,
  );
  await expect(dock(page).getByRole("link", { name: "Call AIMS on +971 56 524 0495" })).toHaveAttribute(
    "href",
    "tel:+971565240495",
  );
  await scrollTo(page, "end");
  await expect(dock(page)).toBeHidden();
});

test("opens the preview notice instead of WhatsApp", async ({ page }) => {
  await page.goto("/product/f18", { waitUntil: "load" });
  await scrollTo(page, (page.viewportSize()?.height ?? 800) * 1.5);
  await dock(page).getByRole("link", { name: "Chat with AIMS on WhatsApp" }).click();
  await expect(page.getByRole("dialog", { name: "Preview: this would contact AIMS" })).toBeVisible();
});

test("never shows on Contact, and waits for the home dive to finish", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "load" });
  await scrollTo(page, 1200);
  await page.waitForTimeout(400);
  await expect(dock(page)).toBeHidden();
  await page.goto("/", { waitUntil: "networkidle" });
  // The dive's script makes its section taller once it runs, so measure its end each time from the live layout.
  const diveEnd = () => page.locator("#home-dive").evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  await scrollTo(page, (await diveEnd()) / 2);
  await page.waitForTimeout(400);
  await expect(dock(page)).toBeHidden();
  await expect
    .poll(async () => {
      await scrollTo(page, (await diveEnd()) + 50);
      return dock(page).isVisible();
    })
    .toBe(true);
});
