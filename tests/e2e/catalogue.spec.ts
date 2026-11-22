import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import products from "../../content/products.json";

const quoteLines = (page: Page) =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("aims.quote.v1") ?? '{"lines":[]}').lines as {
        slug?: string;
        text?: string;
        qty: number;
      }[],
  );

const axe = async (page: Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

test.describe("installer journey (AT-01, catalogue part)", () => {
  test("F18 ×12, AL-M280 ×12 from 'Often fitted with', exit button ×12 via search; survives reload", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "header search is desktop; mobile covered by compare task");
    await page.goto("/product/f18", { waitUntil: "load" });

    const qty = page.getByRole("textbox", { name: "Quantity", exact: true }).first();
    await qty.fill("12");
    await qty.press("Enter");
    await page.getByRole("button", { name: "Add to quote" }).first().click();
    await expect(page.getByRole("status").filter({ hasText: "In quote" })).toContainText("× 12");

    const fitted = page.getByRole("region", { name: "Often fitted with" });
    const lockItem = fitted.getByRole("listitem").filter({ hasText: "AL M280" });
    await lockItem.getByRole("button", { name: "Add to quote" }).click();
    const lockQty = lockItem.getByRole("textbox", { name: /^Quantity, / });
    await lockQty.fill("12");
    await lockQty.press("Enter");

    const search = page.locator("#header-search");
    await search.fill("exit button");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/products\?q=exit\+button|q=exit%20button/);
    const card = page.getByRole("article").filter({ hasText: "ALF B21" });
    await card.getByRole("button", { name: "Add to quote" }).click();
    const cardQty = card.getByRole("textbox", { name: /^Quantity, / });
    await cardQty.fill("12");
    await cardQty.press("Enter");

    await page.reload({ waitUntil: "load" });
    expect(await quoteLines(page)).toEqual([
      { kind: "product", slug: "f18", qty: 12 },
      { kind: "product", slug: "al-m280", qty: 12 },
      { kind: "product", slug: "alf-b21-exit-button", qty: 12 },
    ]);
    await expect(page.getByRole("link", { name: "Quote 3 items" })).toBeVisible();
  });
});

test.describe("search", () => {
  test("AT-03: header search 'sa20' shows BioPro SA20 first, and the URL reproduces it", async ({
    page,
    browser,
    isMobile,
  }) => {
    test.skip(isMobile, "header search field is desktop");
    await page.goto("/", { waitUntil: "load" });
    await page.locator("#header-search").fill("sa20");
    await page.locator("#header-search").press("Enter");
    await expect(page.getByRole("article").first()).toContainText("SA20");

    const fresh = await (await browser.newContext()).newPage();
    await fresh.goto(page.url().replace(/^.*?\/products/, "http://localhost:3100/products"));
    await expect(fresh.getByRole("article").first()).toContainText("SA20");
    await fresh.context().close();
  });

  test("AT-04: unknown model → clear message, clear search, and 'Ask us' adds a text line", async ({ page }) => {
    await page.goto("/products?q=XYZ-999", { waitUntil: "load" });
    await expect(page.getByText("No products match “XYZ-999”.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear search" })).toBeVisible();
    await page.getByRole("button", { name: "Ask us about “XYZ-999”" }).click();
    await expect(page.getByText("Added to your quote as a request")).toBeVisible();
    expect(await quoteLines(page)).toEqual([expect.objectContaining({ kind: "custom", text: "XYZ-999", qty: 1 })]);
    await axe(page);
  });

  test("old category URL lands on a filtered, non-empty listing", async ({ page }) => {
    await page.goto("/category/visible-light", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/products\/access-control\?verify=face$/);
    await expect(page.getByRole("article").first()).toBeVisible();
    await expect(page.locator("#rail-verify-face")).toBeChecked();
  });
});

test.describe("compare (AT-06 + review: the phone task)", () => {
  test("pick F18 and SA20, compare, add the preferred model, return to the same results", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/products?q=f18", { waitUntil: "load" });
    const search = page.getByRole("searchbox", { name: "Search products" });
    await expect(search).toHaveValue("f18"); // the URL-driven list has taken over from the static fallback
    await page
      .getByRole("article")
      .filter({ hasText: "F18" })
      .first()
      .getByRole("checkbox", { name: /Compare/ })
      .check();
    await search.fill("sa20");
    await expect(page).toHaveURL(/q=sa20/);
    await page
      .getByRole("article")
      .filter({ hasText: "SA20" })
      .first()
      .getByRole("checkbox", { name: /Compare/ })
      .check();

    const tray = page.getByRole("region", { name: "Compare products" });
    await expect(tray).toContainText("2 of 3 selected");
    await expect(page).toHaveURL(/cmp=f18,bio-pro-sa20/); // URL writes are debounced
    const listingUrl = page.url();
    await tray.getByRole("link", { name: "Compare 2" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Compare products" })).toBeVisible();
    await expect(page.getByText("Not listed by AIMS").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText("Differs").locator("visible=true").first()).toBeVisible();
    await expect(
      page
        .getByText(/standard wiring format/)
        .locator("visible=true")
        .first(),
    ).toBeVisible();
    // No sideways scrolling on a phone (AT-09).
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const addSa20 = page.getByRole("button", { name: "Add to quote" }).locator("visible=true").nth(1);
    await addSa20.click();
    expect((await quoteLines(page)).map((l) => l.slug)).toEqual(["bio-pro-sa20"]);
    await axe(page);

    await page.getByRole("link", { name: /Back to results/ }).click();
    await expect(page).toHaveURL(listingUrl);
    await expect(page.getByRole("searchbox", { name: "Search products" })).toHaveValue("sa20");
    await expect(page.getByRole("region", { name: "Compare products" })).toContainText("2 of 3 selected");
    if (isMobile) await expect(page.getByRole("button", { name: "Filters" })).toBeVisible();
  });

  test("a fourth product can't be added to compare", async ({ page }) => {
    await page.goto("/products/access-control?cmp=f18,bio-pro-sa20,inbio-pro-260", { waitUntil: "load" });
    const unchecked = page
      .getByRole("checkbox", { name: /^Compare/ })
      .and(page.locator(":not(:checked)"))
      .first();
    await expect(unchecked).toBeDisabled();
    await expect(page.getByText("You can compare up to 3 products.")).toBeVisible();
  });
});

test.describe("filters", () => {
  test("mobile: filters open in a sheet, apply live and keep the count", async ({ page, isMobile }) => {
    test.skip(!isMobile, "sheet is mobile only");
    await page.goto("/products/time-attendance", { waitUntil: "load" });
    await page.getByRole("button", { name: "Filters" }).click();
    const sheet = page.getByRole("dialog", { name: "Filters" });
    await sheet.getByRole("checkbox", { name: /^Face/ }).check();
    await expect(page).toHaveURL(/verify=face/);
    const show = sheet.getByRole("button", { name: /^Show \d+ products$/ });
    const n = Number((await show.textContent())!.match(/\d+/)![0]);
    await axe(page);
    await show.click();
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("article")).toHaveCount(n);
    await expect(page.getByRole("button", { name: "Filters (1)" })).toBeVisible();
  });
});

test.describe("product pages", () => {
  test("every live product page returns 200; duplicates 301 to the canonical", async ({ request, isMobile }) => {
    test.skip(isMobile, "one pass is enough");
    for (const p of products as { slug: string; duplicateOf?: string }[]) {
      const res = await request.get(`/product/${p.slug}`, { maxRedirects: 0 });
      if (p.duplicateOf) {
        expect(res.status(), p.slug).toBe(301);
        expect(res.headers().location, p.slug).toContain(`/product/${p.duplicateOf}`);
      } else expect(res.status(), p.slug).toBe(200);
    }
  });

  test("product page has one H1, canonical, hreflang and valid Product JSON-LD", async ({ page }) => {
    await page.goto("/product/f18");
    await expect(page.locator("h1")).toHaveText("ZKTeco F18");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/product\/f18$/);
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", /\/ar\/product\/f18$/);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const product = ld.map((j) => JSON.parse(j)).find((d) => d["@type"] === "Product");
    expect(product).toMatchObject({ name: "ZKTeco F18", sku: "F18", brand: { name: "ZKTeco" } });
    expect(product.offers).toBeUndefined(); // no prices are published
  });

  test("a product without structured specs says so and offers a way to ask", async ({ page }) => {
    await page.goto("/product/kr600");
    await expect(page.getByText("AIMS hasn't published structured specifications")).toBeVisible();
    await expect(page.getByRole("link", { name: /Ask for the specifications/ })).toHaveAttribute("href", /wa\.me/);
  });
});
