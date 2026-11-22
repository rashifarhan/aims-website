import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const axeClean = async (page: import("@playwright/test").Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

test("old /enquiry URL lands on /contact (301)", async ({ request }) => {
  const res = await request.get("/enquiry", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers().location).toMatch(/\/contact$/);
});

test("each need routes to AIMS's own published channel", async ({ page }) => {
  await page.goto("/contact");
  const panel = page.getByRole("region", { name: "Sales and quotes" });
  await expect(panel.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/971565240495\?text=/,
  );

  // Software requests: AIMS's software buttons use the Dubai showroom line.
  await page.locator("label").filter({ hasText: "Software and setup" }).click();
  const software = page.getByRole("region", { name: "Software and setup" });
  await expect(software.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/97148808445\?text=/,
  );
  await expect(software.getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:+97148808445");

  await page.locator("label").filter({ hasText: "Showroom visit" }).click();
  await expect(page.getByText("Opening hours aren't published yet")).toBeVisible();
  await expect(page.getByRole("link", { name: /Get directions/ }).first()).toHaveAttribute(
    "href",
    /maps\.app\.goo\.gl/,
  );
});

test("contact buttons open the preview notice, not AIMS (risk R5)", async ({ page }) => {
  await page.goto("/contact");
  await page
    .getByRole("region", { name: "Sales and quotes" })
    .getByRole("link", { name: /WhatsApp/ })
    .click();
  const notice = page.getByRole("dialog", { name: "Preview: this would contact AIMS" });
  await expect(notice).toContainText("+971 56 524 0495");
  await expect(notice.locator("pre")).toContainText("I need advice and a quotation");
  await expect(page).toHaveURL(/\/contact$/);
});

test("short message: empty is refused; a message becomes an advice line in the quote", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("label").filter({ hasText: "Showroom visit" }).click();
  await page.getByRole("button", { name: "Add to my request" }).click();
  const message = page.getByRole("textbox", { name: "Your message" });
  await expect(message).toBeFocused();
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Write a short message first.")).toBeVisible();
  await axeClean(page);

  await message.fill("I'd like to see the SpeedFace-V5L");
  await page.getByRole("textbox", { name: "Preferred day and time (optional)" }).fill("Tuesday morning");
  await page.getByRole("button", { name: "Add to my request" }).click();
  await expect(page.getByText("Added to your request.")).toBeVisible();

  const lines = await page.evaluate(() => JSON.parse(localStorage.getItem("aims.quote.v1") ?? "{}").lines);
  expect(lines).toEqual([
    expect.objectContaining({
      kind: "custom",
      text: "Showroom visit: I'd like to see the SpeedFace-V5L (preferred: Tuesday morning)",
    }),
  ]);
  await page.getByRole("link", { name: "Review quote request" }).click();
  // On the quote page it is both an item line and part of the message preview.
  await expect(
    page.getByRole("listitem").filter({ hasText: "Showroom visit: I'd like to see the SpeedFace-V5L" }),
  ).toBeVisible();
  await expect(page.locator("pre")).toContainText("Not listed: Showroom visit: I'd like to see the SpeedFace-V5L");
});

test("three branches with real numbers and map links; no embedded map", async ({ page }) => {
  const external: string[] = [];
  page.on(
    "request",
    (r) => !r.url().startsWith("http://localhost") && !r.url().startsWith("data:") && external.push(r.url()),
  );
  await page.goto("/contact");
  const branches = page.getByRole("region", { name: "Visit or call" });
  await expect(branches.getByRole("heading", { level: 3 })).toHaveText([
    "Head office, Dubai",
    "Dubai showroom",
    "Abu Dhabi office",
  ]);
  for (const tel of ["+97142523253", "+97148808445", "+97125466047"]) {
    await expect(branches.locator(`a[href="tel:${tel}"]`)).toHaveCount(1);
  }
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(external).toEqual([]);
});

test("Arabic contact page is RTL and translated", async ({ page }) => {
  await page.goto("/ar/contact");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("تواصل مع AIMS");
  await axeClean(page);
});
