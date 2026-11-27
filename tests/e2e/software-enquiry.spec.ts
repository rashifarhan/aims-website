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
      // The hub's platform list re-renders on hydration (its filters come from the URL), so a click in that instant
      // can land on the server-rendered link React is replacing and be lost; wait for the page to settle first.
      await page.waitForLoadState("networkidle");
      let expected: string;
      if (source === "guidance") {
        expected = labels.softwareCentre.guidanceLine;
        await page.locator("main .ps-hero").getByRole("link", { name: labels.softwareCentre.primary }).click();
      } else if (source === "external platform") {
        expected = "BioTime 8.5";
        const card = page.locator(".sw-card").filter({ has: page.getByRole("heading", { name: /BioTime 8\.5/ }) });
        await expect(card.getByRole("heading").getByRole("link")).toHaveAttribute("href", /^https:\/\/aimsuae.me\//);
        await card
          .getByRole("link", { name: labels.softwareCentre.askPlatform.replace("{name}", "BioTime 8.5") })
          .click();
      } else {
        expected = "BioTime 9.5";
        await page.locator(`a.sw-card-link[href="${prefix}/software/biotime-9-5"]`).click();
        // Direction 2: Add to quote opens out of the platform's screen; focus opens it, and Enter acts on it.
        const inside = page.locator("main .ps-inside");
        await inside.getByRole("button", { name: labels.softwarePage.add }).focus();
        await page.keyboard.press("Enter");
        await inside.getByRole("link", { name: labels.softwarePage.viewQuote }).focus();
        await page.keyboard.press("Enter");
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

// The enquiry actions are real links the quote page fulfils: they work without JavaScript, and the request is
// consumed once, so a reload never brings back a line the buyer removed.
test("software enquiry links work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/software");
  await page.locator("main .ps-hero").getByRole("link", { name: en.softwareCentre.primary }).click();
  await expect(page).toHaveURL(/\/quote\?software=guidance$/);
  await context.close();
});

test("a software link is added once and its parameter is dropped", async ({ page }) => {
  await page.goto("/quote?software=bio-security-3-2");
  await expect(page.getByText("Bio Security 3.2 software", { exact: false }).first()).toBeVisible();
  await expect(page).toHaveURL(/\/quote$/);
  await page
    .getByRole("button", { name: /Remove/ })
    .first()
    .click();
  await page.reload();
  await expect(page.getByText("Bio Security 3.2 software", { exact: false })).toHaveCount(0);
});

test("an unknown software slug adds nothing", async ({ page }) => {
  await page.goto("/quote?software=not-a-platform");
  await expect(page.locator('input[name="need"][value="software"]')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aims.quote.v1") ?? "{}").lines ?? [])).toEqual([]);
});

test("a mixed quote keeps the buyer's chosen need", async ({ page }) => {
  await page.goto("/quote?need=install");
  await expect(page.locator('input[name="need"][value="install"]')).toBeChecked();
  await page.goto("/quote?software=biotime-9-5");
  await expect(page.getByText("BioTime 9.5 software", { exact: false }).first()).toBeVisible();
  await expect(page.locator('input[name="need"][value="install"]')).toBeChecked();
});
