import { expect, test } from "@playwright/test";

test.describe("header and menus", () => {
  test("desktop: Products menu opens, closes on Esc and returns focus", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation only");
    await page.goto("/");
    const button = page.getByRole("button", { name: "Products" });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Time attendance/ }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("desktop: '/' focuses search and submitting goes to the listing", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcut is desktop only");
    await page.goto("/"); // shortcut attaches on hydration; toPass retries until then
    const input = page.locator("#header-search");
    await expect(async () => {
      await page.keyboard.press("/");
      await expect(input).toBeFocused({ timeout: 500 });
    }).toPass();
    await input.fill("F18");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/products\?q=F18$/);
  });

  test("mobile: menu sheet is a modal dialog; Esc closes and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile menu only");
    await page.goto("/");
    const open = page.getByRole("button", { name: "Open menu" });
    await open.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await sheet.locator("summary", { hasText: "Products" }).click();
    await expect(sheet.getByRole("link", { name: /Door hardware/ })).toBeVisible();
    await expect(sheet.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /wa\.me\/971565240495/);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(open).toBeFocused();
  });

  test("language switch points at the same page in the other language", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop header link");
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "العربية" })).toHaveAttribute("href", "/ar");
    await page.goto("/ar");
    await expect(page.getByRole("banner").getByRole("link", { name: "English" })).toHaveAttribute("href", "/");
  });

  // The footer is the skill's closing screen (layout-v4.md 2): the main action worded as in the
  // header, and a directory that reaches Contact, where AIMS's real phone lines live (contact.spec).
  test("footer closes with the main action and links to the contact page", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("heading", { level: 2 })).toHaveCount(1);
    await expect(footer.getByRole("link", { name: "Request a quote" })).toHaveAttribute("href", "/quote");
    await expect(footer.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute("href", "/contact");
  });
});
