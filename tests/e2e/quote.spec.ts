import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const seed = (page: Page, lines: unknown[], context: Record<string, unknown> = {}) =>
  page.addInitScript(
    (data) => localStorage.setItem("aims.quote.v1", data),
    JSON.stringify({ v: 1, updatedAt: Date.now(), lines, context }),
  );

const installerLines = [
  { kind: "product", slug: "f18", qty: 12 },
  { kind: "product", slug: "al-m280", qty: 12 },
  { kind: "product", slug: "alf-b21-exit-button", qty: 12 },
];

const axe = async (page: Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

test("empty list shows the empty state and a way to describe an item", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByText("Your quote list is empty. Browse products or describe what you need.")).toBeVisible();
  await page.getByRole("button", { name: "+ Describe an item we don't list" }).click();
  await page.getByRole("textbox", { name: "Item description" }).fill("2-door controller with 4 readers");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(page.getByRole("heading", { name: /Items · 1/ })).toBeVisible();
});

test("AT-01 (end): the three lines arrive on the quote page with their quantities", async ({ page }) => {
  await seed(page, installerLines);
  await page.goto("/quote");
  const items = page.getByRole("region", { name: /Items · 3/ });
  for (const name of ["ZKTeco F18", "AL M280", "ALF B21"]) {
    await expect(
      items
        .getByRole("listitem")
        .filter({ hasText: name })
        .getByRole("textbox", { name: /^Quantity/ }),
    ).toHaveValue("12");
  }
  await expect(page.getByText("3 items · 36 units").first()).toBeVisible();
});

test("AT-02: export to Kenya → the WhatsApp message has every line, quantity, Kenya and the buyer type", async ({
  page,
}) => {
  await seed(page, installerLines);
  await page.goto("/quote");
  await page.getByRole("radio", { name: /Delivery abroad/ }).check();
  await page.getByRole("textbox", { name: "Destination country" }).fill("Kenya");
  // Chip radios: the label is what people click.
  await page.locator("label").filter({ hasText: "Distributor abroad" }).click();
  await expect(page.getByRole("radio", { name: "Distributor abroad" })).toBeChecked();
  await page.getByRole("button", { name: "Continue to WhatsApp" }).click();

  const notice = page.getByRole("dialog", { name: "Preview: this would contact AIMS" });
  await expect(notice).toBeVisible();
  const message = await notice.locator("pre").textContent();
  for (const part of ["ZKTeco F18 (F18) × 12", "(AL M280) × 12", "(ALF B21) × 12", "Kenya", "Distributor abroad"]) {
    expect(message).toContain(part);
  }
  expect(message).toMatch(/ref Q-\d{4}-\d{4}/);
  await expect(notice.getByText("Nothing has been sent from this preview.")).toBeVisible();
  await expect(notice.getByRole("link", { name: "Open anyway" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/971565240495\?text=/,
  );
});

test("AT-05: empty send → focused error summary, invalid fields marked, entries kept; any country code accepted", async ({
  page,
}) => {
  await seed(page, installerLines);
  await page.goto("/quote");
  await page.getByRole("textbox", { name: "Company (optional)" }).fill("Northgate Technical");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  const summary = page.getByRole("region", { name: /Fix \d+ things? before sending/ });
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveText([
    "Choose what you need.",
    "Enter your name.",
    "Add a WhatsApp number, phone or email so we can reply.",
  ]);
  await expect(page.getByRole("textbox", { name: "Name" })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("textbox", { name: "Company (optional)" })).toHaveValue("Northgate Technical");

  // Links move focus to the field.
  await summary.getByRole("link", { name: "Enter your name." }).click();
  await expect(page.getByRole("textbox", { name: "Name" })).toBeFocused();

  const phone = page.getByRole("textbox", { name: "Mobile or WhatsApp" });
  await phone.fill("050 123 4567");
  await expect(page.getByText("Enter a mobile number with country code").first()).toBeVisible();
  for (const ok of ["+971 50 123 4567", "+254 712 345 678"]) {
    await phone.fill(ok);
    await expect(phone).not.toHaveAttribute("aria-invalid", "true");
  }
  await axe(page);
});

test("AT-07: preview send makes no third-party request and the receipt says nothing was sent", async ({
  page,
  baseURL,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith("data:")) external.push(r.url());
  });
  await seed(page, installerLines, { need: "install", emirate: "dubai" });
  await page.goto("/quote");
  await page.getByRole("textbox", { name: "Name" }).fill("Rashid Khan");
  await page.getByRole("textbox", { name: "Mobile or WhatsApp" }).fill("+971 50 123 4567");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  const receipt = page.getByRole("heading", { name: "Request ready" });
  await expect(receipt).toBeFocused();
  await expect(page.getByText("Demo: nothing was sent to AIMS.")).toBeVisible();
  await expect(page.getByText(/^Q-\d{4}-\d{4}$/)).toBeVisible();
  await axe(page);
  expect(external).toEqual([]);

  // Items and the need survive (the list is only cleared on request); contact details are never stored.
  const stored = await page.evaluate(() => localStorage.getItem("aims.quote.v1") ?? "");
  expect(stored).toContain('"need":"install"');
  expect(stored).not.toContain("Rashid");
});

test("AT-08: the quote can be completed with the keyboard alone", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard flow on desktop");
  await seed(page, installerLines.slice(0, 1));
  await page.goto("/quote");
  await page.getByRole("radio", { name: /Supply only/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("textbox", { name: "Name" }).focus();
  await page.keyboard.type("Rashid");
  await page.keyboard.press("Tab"); // company
  await page.keyboard.press("Tab"); // phone
  await page.keyboard.type("+971 50 123 4567");
  await page.getByRole("button", { name: "Send enquiry" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Request ready" })).toBeFocused();
});

test("removing a line can be undone", async ({ page }) => {
  await seed(page, installerLines);
  await page.goto("/quote");
  await page.getByRole("button", { name: /^Remove ZKTeco F18$/ }).click();
  await expect(page.getByRole("region", { name: /Items · 2/ })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("region", { name: /Items · 3/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "ZKTeco F18" }).first()).toBeVisible();
});

test("contact links in the preview open the notice instead of contacting AIMS (risk R5)", async ({
  page,
  isMobile,
}) => {
  await page.goto("/product/f18");
  if (isMobile)
    await page
      .getByRole("link", { name: /Ask on WhatsApp/ })
      .first()
      .click();
  else await page.getByRole("link", { name: /Ask on WhatsApp/ }).click();
  const notice = page.getByRole("dialog", { name: "Preview: this would contact AIMS" });
  await expect(notice).toBeVisible();
  await expect(notice.locator("pre")).toContainText("ZKTeco F18");
  await expect(page).toHaveURL(/\/product\/f18$/);
  await notice.getByRole("button", { name: "Close" }).first().click();
  await expect(notice).toBeHidden();

  // The phone lines live on the Contact page since the footer became the closing screen.
  await page.goto("/contact");
  await page.getByRole("region", { name: "Visit or call" }).locator('a[href="tel:+97142523253"]').click();
  await expect(notice).toContainText("On the live site this calls AIMS (+971 4 252 3253).");
});
