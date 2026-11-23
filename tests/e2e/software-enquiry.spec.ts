import { expect, test } from "@playwright/test";
import en from "../../src/i18n/messages/en.json";
import ar from "../../src/i18n/messages/ar.json";

for (const [lang, labels] of [
  ["en", en],
  ["ar", ar],
] as const) {
  const prefix = lang === "ar" ? "/ar" : "";
  for (const source of ["guidance", "external platform", "platform detail"] as const) {
    test(`${lang}: ${source} carries software intent through the editable brief and receipt`, async ({ page }) => {
      await page.goto(prefix + "/software");
      let expected: string;
      if (source === "guidance") {
        expected = labels.softwareCentre.guidanceLine;
        await page.locator(".sw-centre-intro").getByRole("button", { name: labels.softwareCentre.primary }).click();
      } else if (source === "external platform") {
        expected = "BioTime 8.5";
        const card = page.locator(".sw-card").filter({ has: page.getByRole("heading", { name: /BioTime 8\.5/ }) });
        await expect(card.locator("a")).toHaveAttribute("href", /^https:\/\/aimsuae.me\//);
        await card.getByRole("button").click();
      } else {
        expected = "BioTime 9.5";
        await page.locator(`a.sw-card-link[href="${prefix}/software/biotime-9-5"]`).click();
        await page.locator(".sw-hero").getByRole("button", { name: labels.softwarePage.add }).click();
        await page.locator(".sw-hero").getByRole("link", { name: labels.softwarePage.viewQuote }).click();
      }
      await expect(page.locator('input[name="need"][value="software"]')).toBeChecked();
      await expect(page.locator("#quote-doors")).toHaveCount(0);
      await page.locator("#quote-software-existing").fill("F18 and SA20");
      await page.reload();
      await expect(page.locator("#quote-software-existing")).toHaveValue("F18 and SA20");
      await page.locator("#quote-name").fill("Buyer");
      await page.locator("#quote-phone").fill("+971501234567");
      await page.getByRole("button", { name: labels.quote.sendCta }).click();
      await expect(page.locator("#receipt-title")).toBeFocused();
      const message = page.locator(".message-preview");
      await expect(message).toContainText(expected);
      await expect(message).toContainText("F18 and SA20");
      await expect(message).toContainText(labels.quote.needs.software);
    });
  }
}
