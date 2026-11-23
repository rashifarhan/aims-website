import { expect, test } from "@playwright/test";

for (const prefix of ["", "/ar"]) {
  for (const [market, path] of [
    ["Kenya", "/zkteco-distributors-in-kenya"],
    ["Oman", "/zkteco-distributor-in-oman"],
  ]) {
    test(`${prefix || "en"}: ${market} survives model research, edits and reload`, async ({ page }) => {
      await page.goto(prefix + path);
      const link = page.locator("#models h3 a").first();
      await link.focus();
      await link.press("Enter");
      await page.waitForURL("**/product/f18?**");
      expect(await page.evaluate(() => localStorage.getItem("aims.quote.v1"))).toBeNull();
      await page.locator("main button.home-button").first().click();
      await page.goto(prefix + "/product/bio-pro-sa20");
      await page.locator("main button.home-button").first().click();
      await page.goBack();
      await page.goto(prefix + "/quote");
      await expect(page.locator("#quote-country")).toHaveValue(market);
      const count = page.locator('input[inputmode="numeric"]').first();
      await count.fill("4");
      await count.press("Enter");
      await page.reload();
      await expect(count).toHaveValue("4");
      await expect(page.getByText("ZKTeco Biopro SA20", { exact: true }).first()).toBeVisible();
      await expect(page.locator("#quote-country")).toHaveValue(market);
      const message = page.locator(".message-preview").first();
      await expect(message).toContainText("F18) × 4");
      await expect(message).toContainText("SA20) × 1");
      await expect(message).toContainText(market);
      await page.locator("#quote-country").fill("Tanzania");
      await page.goto(prefix + "/quote?need=export&country=" + market);
      await expect(page.locator("#quote-country")).toHaveValue("Tanzania");
    });
  }
  test(`${prefix || "en"}: Dubai installation carries an editable emirate`, async ({ page }) => {
    await page.goto(prefix ? "/ar/zkteco-dubai" : "/zkteco-distributor-in-dubai");
    await page.locator('main a[href*="need=install"]').first().click();
    await expect(page.locator("#quote-emirate")).toHaveValue("dubai");
    await page.locator("#quote-emirate").selectOption("sharjah");
    await page.reload();
    await expect(page.locator("#quote-emirate")).toHaveValue("sharjah");
  });
}

test("a market catalogue selection can be compared immediately", async ({ page }) => {
  await page.goto("/zkteco-distributors-in-kenya");
  await page.locator("#models .home-text-link").click();
  const search = page.getByRole("searchbox", { name: "Search products" });
  for (const model of ["F18", "SA20"]) {
    await search.fill(model);
    await page.getByRole("article").filter({ hasText: model }).first().getByRole("checkbox").check();
  }
  await page.getByRole("link", { name: "Compare 2", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Compare products" })).toBeVisible();
  await page.getByRole("button", { name: "Add to quote", exact: true }).first().click();
  await page.goto("/quote");
  await expect(page.locator("#quote-country")).toHaveValue("Kenya");
});
