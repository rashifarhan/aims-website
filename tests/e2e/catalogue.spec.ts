import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { restMotion } from "./rest";
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

/** Let finite CSS animations (the hero entrance) end, so axe audits the settled frame (smoke.spec.ts). */
const settle = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a instanceof CSSAnimation && Number.isFinite(a.effect?.getTiming().iterations))
        .map((a) => (a.timeline instanceof DocumentTimeline ? a.finished.catch(() => undefined) : a.cancel())),
    ),
  );
const axe = async (page: Page) => {
  await settle(page);
  await restMotion(page);
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
    await expect(page.getByRole("status").filter({ hasText: "On your list" })).toContainText("× 12");

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
    // The same URL in a fresh context (its own origin, so the spec runs on any PORT, not only 3100).
    await fresh.goto(page.url());
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

test.describe("pagination and sort", () => {
  const cards = (page: Page) => page.getByRole("article");
  const pagination = (page: Page) => page.getByRole("navigation", { name: "Pagination" });
  const slugs = (page: Page, n: number) =>
    cards(page)
      .locator("h3 a")
      .evaluateAll(
        (els, count) => els.slice(0, count).map((a) => (a.getAttribute("href") ?? "").split("?")[0].split("/").pop()),
        n,
      );

  test("12 products a page; Next shows the next 12 and Back returns to page 1", async ({ page }) => {
    await page.goto("/products", { waitUntil: "load" });
    await expect(cards(page)).toHaveCount(12);
    await expect(pagination(page).getByText("Showing 1–12 of 159")).toBeVisible();
    const first = await slugs(page, 12);

    await pagination(page).getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(pagination(page).getByText("Showing 13–24 of 159")).toBeVisible();
    expect(await slugs(page, 12)).not.toEqual(first);

    await page.goBack();
    await expect(page).not.toHaveURL(/page=/);
    expect(await slugs(page, 12)).toEqual(first);
  });

  test("a page past the end clamps to the last page", async ({ page }) => {
    await page.goto("/products?page=99", { waitUntil: "load" });
    await expect(pagination(page).getByText("Showing 157–159 of 159")).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(page).toHaveURL(/page=14/);
  });

  test("searching from page 3 lands on page 1 with results", async ({ page }) => {
    await page.goto("/products?page=3", { waitUntil: "load" });
    // Retry until the page has hydrated and the field's handler is attached.
    await expect(async () => {
      await page.locator("#listing-search").fill("f18");
      await expect(page).not.toHaveURL(/page=/, { timeout: 1000 });
    }).toPass();
    await expect(cards(page).first()).toBeVisible();
  });

  test("ticking a filter from page 3 lands on page 1", async ({ page, isMobile }) => {
    test.skip(isMobile, "the facet rail is desktop; the mobile sheet shares the same handler");
    await page.goto("/products?page=3", { waitUntil: "load" });
    await expect(async () => {
      await page
        .getByRole("checkbox", { name: /^Fingerprint/ })
        .first()
        .check();
      await expect(page).not.toHaveURL(/page=/, { timeout: 1000 });
    }).toPass();
    await expect(cards(page).first()).toBeVisible();
  });

  test("sort by name puts the catalogue in A–Z order", async ({ page }) => {
    await page.goto("/products", { waitUntil: "load" });
    await expect(async () => {
      await page.getByLabel("Sort").selectOption("name");
      await expect(page).toHaveURL(/sort=name/, { timeout: 1000 });
    }).toPass();
    const expected = (products as { slug: string; name: string; duplicateOf?: string }[])
      .filter((p) => !p.duplicateOf)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
      .slice(0, 3)
      .map((p) => p.slug);
    expect(await slugs(page, 3)).toEqual(expected);
  });
});

test.describe("quick picks", () => {
  test("a pick applies its filters, shows pressed, and shows as many products as its count", async ({ page }) => {
    await page.goto("/products", { waitUntil: "load" });
    const pick = page.getByRole("group", { name: "Popular" }).getByRole("button", { name: /^Turnstiles & gates/ });
    const count = Number((await pick.textContent())!.match(/(\d+)\s*$/)![1]);
    expect(count).toBeGreaterThan(0);

    await expect(async () => {
      await pick.click();
      await expect(page).toHaveURL(/type=pedestrian/, { timeout: 1000 });
    }).toPass();
    await expect(pick).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('p[aria-live="polite"]').filter({ hasText: /products?$/ })).toHaveText(
      new RegExp(`^${count} products?$`),
    );
  });

  test("clicking a pressed pick again turns it off", async ({ page }) => {
    await page.goto("/products?q=f18", { waitUntil: "load" });
    const pick = page.getByRole("group", { name: "Popular" }).getByRole("button", { name: /^Fingerprint/ });
    await expect(async () => {
      await pick.click();
      await expect(pick).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass();
    await expect(page).toHaveURL(/verify=fingerprint/);

    await pick.click();
    await expect(pick).toHaveAttribute("aria-pressed", "false");
    await expect(page).not.toHaveURL(/verify=/);
    await expect(page).toHaveURL(/q=f18/);
  });

  test("a family page has no quick picks", async ({ page }) => {
    await page.goto("/products/time-attendance", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: "Results" })).toBeAttached();
    await expect(page.getByRole("group", { name: "Popular" })).toHaveCount(0);
  });

  test("the row scrolls inside itself; the page never scrolls sideways at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/products", { waitUntil: "load" });
    await expect(page.getByRole("group", { name: "Popular" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
});

test.describe("facet groups", () => {
  test("the family tabs replace the Family group; Brand starts closed and opens", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is desktop; the sheet uses the same panel");
    await page.goto("/products", { waitUntil: "load" });
    const rail = page.getByRole("complementary", { name: "Filters" });
    // Direction 2 (client request, 27 Nov 2026): the families are tabs above the list, so the rail drops its group.
    const tabs = page.getByRole("group", { name: "Product families" });
    await expect(tabs.getByRole("button", { name: /^Time attendance/ })).toBeVisible();
    await expect(rail.getByRole("checkbox", { name: /^Time attendance/ })).toHaveCount(0);
    await expect(rail.getByRole("checkbox", { name: /^ZKTeco/ })).toBeHidden();

    await rail.locator("summary", { hasText: "Brand" }).click();
    await expect(rail.getByRole("checkbox", { name: /^ZKTeco/ })).toBeVisible();
  });

  test("a group with a selected option starts open", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is desktop; the sheet uses the same panel");
    await page.goto("/products?brand=alpha", { waitUntil: "load" });
    const rail = page.getByRole("complementary", { name: "Filters" });
    await expect(rail.getByRole("checkbox", { name: /^Alpha/ })).toBeChecked();
  });

  test("a group the buyer opened stays open when its last option is cleared", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is desktop; the sheet uses the same panel");
    await page.goto("/products", { waitUntil: "load" });
    const rail = page.getByRole("complementary", { name: "Filters" });
    await rail.locator("summary", { hasText: "Brand" }).click();
    const alpha = rail.getByRole("checkbox", { name: /^Alpha/ });
    await expect(async () => {
      await alpha.check();
      await expect(page).toHaveURL(/brand=alpha/, { timeout: 1000 });
    }).toPass();
    await alpha.uncheck();
    await expect(page).not.toHaveURL(/brand=/);
    await expect(rail.getByRole("checkbox", { name: /^ZKTeco/ })).toBeVisible();
  });
});

test.describe("can't find your model", () => {
  const panel = (page: Page) => page.getByRole("region", { name: "Can't find your model?" });

  test("the panel is there with results; adding a request puts a custom line in the quote", async ({ page }) => {
    await page.goto("/products", { waitUntil: "load" });
    await expect(panel(page)).toBeVisible();
    await expect(async () => {
      await panel(page).getByLabel("Model or requirement").fill("ZK-9000");
      await panel(page).getByRole("button", { name: "Add to quote request" }).click();
      await expect(panel(page).getByRole("status")).toContainText("Added to your quote request.", { timeout: 1000 });
    }).toPass();
    expect(await quoteLines(page)).toEqual([expect.objectContaining({ kind: "custom", text: "ZK-9000", qty: 1 })]);
  });

  test("an empty request adds nothing", async ({ page }) => {
    await page.goto("/products", { waitUntil: "load" });
    await panel(page).getByRole("button", { name: "Add to quote request" }).click();
    expect(await quoteLines(page)).toEqual([]);
  });

  test("it is prefilled with the search and offers WhatsApp, a call and the way to solutions and the showroom", async ({
    page,
  }) => {
    await page.goto("/products?q=XYZ-999", { waitUntil: "load" });
    await expect(panel(page).getByLabel("Model or requirement")).toHaveValue("XYZ-999");
    await expect(panel(page).getByRole("link", { name: "Ask on WhatsApp" })).toHaveAttribute(
      "href",
      /wa\.me\/\d+\?text=.*XYZ-999/,
    );
    await expect(panel(page).getByRole("link", { name: "Call the showroom" })).toHaveAttribute("href", /^tel:\+971/);
    await expect(panel(page).getByRole("link", { name: /Compare solutions/ })).toHaveAttribute("href", "/solutions");
    await expect(panel(page).getByRole("link", { name: /Deira showroom/ })).toHaveAttribute("href", "/about#showrooms");
  });

  test("a near-miss search with no results lists the closest models", async ({ page }) => {
    await page.goto("/products?q=F19", { waitUntil: "load" });
    await expect(page.getByText("No products match “F19”.")).toBeVisible();
    await expect(page.getByText("Closest models")).toBeVisible();
    await expect(page.getByRole("link", { name: "F18", exact: true })).toBeVisible();
  });

  test("filters that leave nothing offer a removal that brings products back", async ({ page }) => {
    await page.goto("/products?verify=palm&conn=4g", { waitUntil: "load" });
    await expect(page.getByText("No products match.")).toBeVisible();
    const remove = page.getByRole("button", { name: "Remove Palm (3 products)" });
    await expect(page.getByRole("button", { name: "Remove 4G (3 products)" })).toBeVisible();
    await expect(async () => {
      await remove.click();
      await expect(page).not.toHaveURL(/verify=palm/, { timeout: 1000 });
    }).toPass();
    await expect(page.locator('p[aria-live="polite"]').filter({ hasText: /products?$/ })).toHaveText("3 products");
  });
});

test.describe("Arabic listing", () => {
  test("page 2 in Arabic: RTL, model codes stay LTR, no sideways scroll, axe clean", async ({ page }) => {
    await page.goto("/ar/products?page=2", { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const pagination = page.getByRole("navigation", { name: "التنقل بين الصفحات" });
    await expect(pagination).toBeVisible();
    await expect(pagination.locator('[aria-current="page"]')).toHaveText("2");
    await expect(page.getByRole("article").first().locator("h3 a")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("region", { name: "لم تجد الطراز الذي تبحث عنه؟" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await axe(page);
  });
});
