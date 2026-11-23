import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const seed = (page: Page, lines: unknown[], context: Record<string, unknown> = {}) =>
  page.addInitScript(
    (data) => localStorage.setItem("aims.quote.v1", data),
    JSON.stringify({ v: 1, updatedAt: Date.now(), lines, context }),
  );

/** Let finite CSS animations (the hero entrance) end, so axe audits the settled frame (smoke.spec.ts). */
const settle = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
const axe = async (page: Page) => {
  await settle(page);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

const sendValid = async (page: Page) => {
  await page.getByRole("textbox", { name: "Name" }).fill("Rashid Khan");
  await page.getByRole("textbox", { name: "Mobile or WhatsApp" }).fill("+971 50 123 4567");
  await page.getByRole("button", { name: "Send enquiry" }).click();
};

test("T7: an installation link with an empty list opens the site fields, led by “Describe your site”", async ({
  page,
}) => {
  await page.goto("/quote?need=install");
  const describe = page.getByRole("button", { name: "Describe your site" });
  await expect(describe).toBeVisible();
  await expect(describe).toHaveClass(/home-button/);
  await expect(describe).not.toHaveClass(/home-button-outline/);
  await expect(page.getByRole("link", { name: "Browse products", exact: true })).toHaveClass(/home-secondary/);
  await expect(page.getByRole("radio", { name: /Supply and installation/ })).toBeChecked();
  await expect(page.getByRole("combobox", { name: "Emirate" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Number of doors (optional)" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Number of users (optional)" })).toBeVisible();
  await axe(page);

  await describe.click();
  await page.getByRole("textbox", { name: "Site description" }).fill("6 doors, 80 staff, Dubai office");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(page.getByRole("heading", { name: /Items · 1/ })).toBeVisible();
  // Switching the need keeps the form; contact details are still never stored.
  await page.getByRole("radio", { name: /Supply only/ }).check();
  await expect(page.getByRole("region", { name: "Your details" })).toBeVisible();
});

test("T7: an export link opens the destination fields, led by “Describe what you need”", async ({ page }) => {
  await page.goto("/quote?need=export");
  await expect(page.getByRole("button", { name: "Describe what you need" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Destination country" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse products", exact: true })).toBeVisible();
});

test("counts take their own singular: one line of one unit reads “1 item · 1 unit”", async ({ page }) => {
  await seed(page, [{ kind: "product", slug: "f18", qty: 1 }]);
  await page.goto("/quote");
  await expect(page.getByText("1 item · 1 unit", { exact: true }).first()).toBeVisible();
});

test("“Send enquiry” is the primary action; WhatsApp keeps its colour as the outline", async ({ page }) => {
  await seed(page, [{ kind: "product", slug: "f18", qty: 2 }]);
  await page.goto("/quote");
  const summary = page.getByRole("region", { name: "What AIMS receives" });
  await expect(summary.getByRole("button", { name: "Send enquiry" })).toHaveClass(/home-button/);
  await expect(summary.getByRole("button", { name: "Send enquiry" })).not.toHaveClass(/home-button-outline/);
  await expect(summary.getByRole("button", { name: "Continue to WhatsApp" })).toHaveClass(
    /home-button-outline.*home-button-whatsapp|home-button-whatsapp.*home-button-outline/,
  );
});

test("T8 Arabic: the phone example and the reference read left to right; message lines take their own direction", async ({
  page,
}) => {
  await seed(page, [{ kind: "product", slug: "f18", qty: 1 }], { need: "supply" });
  await page.goto("/ar/quote");
  await expect(page.locator("#quote-phone-hint bdi[dir=ltr]")).toHaveText("+971 50 123 4567");
  const preview = page.locator("#quote-summary pre");
  await expect(preview).toHaveCSS("unicode-bidi", "plaintext");
  const reference = preview.locator("bdi[dir=ltr]");
  await expect(reference).toHaveText(/^Q-\d{4}-\d{4}$/);
  await expect(reference).toHaveCSS("white-space", "nowrap");
  // The message is set in the page's Arabic face; only the reference is mono.
  const fonts = await page.evaluate(() => {
    const family = (sel: string) => getComputedStyle(document.querySelector(sel) as Element).fontFamily;
    return { body: family("body"), pre: family("#quote-summary pre"), ref: family("#quote-summary pre bdi") };
  });
  expect(fonts.pre).toBe(fonts.body);
  expect(fonts.ref).not.toBe(fonts.body);
  await axe(page);
});

test("VERIFY on send: the receipt's lines name the items, need and reply channel; heading keeps focus", async ({
  page,
}) => {
  await seed(page, [{ kind: "product", slug: "f18", qty: 3 }], { need: "install", emirate: "dubai" });
  await page.goto("/quote");
  await sendValid(page);
  await expect(page.getByRole("heading", { name: "Request ready" })).toBeFocused();
  const mark = page.locator(".verify-mark");
  await expect(mark).toHaveAttribute("aria-hidden", "true");
  await expect(mark.locator("li")).toHaveText(["1 item · 3 units", "Supply and installation", "WhatsApp"]);
  // It plays once and stands: after the sequence the tick is fully drawn.
  await expect(mark.locator(".verify-tick")).toHaveCSS("stroke-dashoffset", "0px", { timeout: 3000 });
});

test("VERIFY under reduced motion shows the final frame at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, [{ kind: "product", slug: "f18", qty: 1 }], { need: "supply" });
  await page.goto("/quote");
  await sendValid(page);
  const mark = page.locator(".verify-mark");
  await expect(mark.locator(".verify-tick")).toHaveCSS("animation-name", "none");
  await expect(mark.locator(".verify-tick")).toHaveCSS("stroke-dashoffset", "0px");
  await expect(mark.locator(".verify-disc")).toHaveCSS("opacity", "1");
  for (const line of await mark.locator(".verify-line").all()) await expect(line).toHaveCSS("stroke-dashoffset", "0px");
});
