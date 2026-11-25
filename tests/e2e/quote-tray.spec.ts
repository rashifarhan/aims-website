import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { restMotion } from "./rest";

/**
 * The quote tray (client request, 25 Nov 2026): once the list holds anything, pages that can add to it show what is
 * in it, that it is not sent yet, and the way to send it. It never shows on the quote page or on pages without an
 * add-to-quote control, and it adds no axe violation.
 */
test("the tray appears after an add, counts items and units, and links to the quote", async ({ page }) => {
  await page.goto("/products/time-attendance", { waitUntil: "load" });
  const tray = page.getByRole("complementary", { name: "Your quote list" });
  await expect(tray).toBeHidden();

  const card = page.getByRole("article").first();
  // A click before hydration does nothing, so the add retries until the card confirms it.
  await expect(async () => {
    await card.getByRole("button", { name: "Add to quote" }).click({ timeout: 1000 });
    await expect(card.getByText("On your list")).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(tray).toBeVisible();
  await expect(tray).toContainText("1 item · 1 unit · not sent yet");

  await card.getByRole("button", { name: "Increase quantity" }).click();
  await expect(tray).toContainText("1 item · 2 units");

  await restMotion(page);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);

  await tray.getByRole("link", { name: "Review and send" }).click();
  await expect(page).toHaveURL(/\/quote$/);
  await expect(page.getByRole("complementary", { name: "Your quote list" })).toBeHidden();
});

test("pages without an add-to-quote control keep the header badge only", async ({ page }) => {
  await page.goto("/products/time-attendance", { waitUntil: "load" });
  await page.getByRole("article").first().getByRole("button", { name: "Add to quote" }).click();
  await page.goto("/about", { waitUntil: "load" });
  await expect(page.getByRole("complementary", { name: "Your quote list" })).toBeHidden();
});
