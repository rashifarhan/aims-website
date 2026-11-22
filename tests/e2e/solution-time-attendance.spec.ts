import { expect, test } from "@playwright/test";

const PATH = "/solutions/time-attendance";

for (const locale of ["en", "ar"] as const) {
  const path = locale === "ar" ? `/ar${PATH}` : PATH;
  test(`${locale} time attendance page: one H1, method counts match the listing, quote presets installation`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));

    // Terminals by method: three tiles, each with Add to quote and a filtered listing that returns 200.
    const tiles = page.locator("#methods .tile");
    await expect(tiles).toHaveCount(3);
    await expect(tiles.getByRole("button", { name: /Add to quote|أضف إلى عرض السعر/ })).toHaveCount(3);
    const links = page.locator("#methods .method-tiles__actions a.link");
    for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""))) {
      expect(href).toMatch(/\/products\/time-attendance\?verify=(face|fingerprint|card)$/);
      expect((await request.get(href)).status()).toBe(200);
    }
    // The hero's quote action presets the installation need (Design Doc 12).
    await expect(page.locator(`main a[href="${locale === "ar" ? "/ar" : ""}/quote?need=install"]`)).toHaveCount(1);
  });
}

test("each method tile's count matches the listing it opens", async ({ page, isMobile }) => {
  test.skip(isMobile, "content check, one viewport is enough");
  await page.goto(PATH);
  for (const link of await page.locator("#methods .method-tiles__actions a.link").all()) {
    const count = Number((await link.textContent())?.match(/\d+/)?.[0]);
    const listing = await page.context().newPage();
    await listing.goto((await link.getAttribute("href")) ?? "");
    await expect(listing.getByText(new RegExp(`^${count} products?$`)).first()).toBeVisible();
    await listing.close();
  }
});

// Punch to payroll is the dealt line-carries-colour moment; the drawing is its finished frame,
// with every step and its illustrative-data label readable without motion (Design Doc 8.3).
test("punch to payroll: the moment mounts and reduced motion shows every step and the drawing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  const how = page.locator("#how");
  await expect(how).toHaveAttribute("data-moment-mounted", /.*/);
  await expect(how.locator(".process-rows > li")).toHaveCount(4);
  await expect(how.getByRole("img")).toHaveAttribute("aria-label", /payroll/);
  await expect(how.locator(".ta-drawing")).toContainText("Illustrative data");
  for (const row of await how.locator(".ta-row").all()) await expect(row).toHaveCSS("opacity", "1");
});

test("adding a terminal updates the quote, and the quote opens with installation chosen", async ({ page }) => {
  await page.goto(PATH);
  const tile = page.locator("#methods .tile").first();
  await expect(async () => {
    await tile.getByRole("button", { name: "Add to quote" }).click({ timeout: 1000 });
    await expect(tile.getByText("In quote")).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.locator('main a[href="/quote?need=install"]').click();
  await expect(page).toHaveURL(/\/quote\?need=install$/);
  await expect(page.getByRole("radio", { name: "Supply and installation" })).toBeChecked();
  await expect(page.getByRole("main")).toContainText("IFace 990");
});

test("phones and 320px screens never scroll sideways", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(PATH);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
