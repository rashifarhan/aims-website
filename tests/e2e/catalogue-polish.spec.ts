import { expect, test } from "@playwright/test";

/* Site polish on the T4 listing and the compare view (Design Doc 9 product card, compare tray and table;
   10 T4). Behaviour already covered by catalogue.spec.ts (URL state, sheet, AT-03/04/06) stays there. */

test.describe("listing polish", () => {
  test("opens on products with a photo and published facts, not 'Specs on request'", async ({ page }) => {
    await page.goto("/products", { waitUntil: "load" });
    const first = page.getByRole("article").first();
    await expect(first.locator("dl")).toBeVisible();
    await expect(first).not.toContainText("Specs on request");
    await expect(first.locator("img")).toHaveCount(1);
  });

  test("card: model code in Plex Mono, outline Add, and the same height once added", async ({ page }) => {
    await page.goto("/products/time-attendance", { waitUntil: "load" });
    const card = page.getByRole("article").first();
    const model = card.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(model).toHaveAttribute("dir", "ltr");
    // Retrying assertion: on a phone the streamed listing settles after load (a one-shot read saw "").
    await expect(model).toHaveCSS("font-family", /plex|mono/i);

    const add = card.getByRole("button", { name: "Add to quote" });
    // Outline: a grid of cards never shows a wall of filled green.
    // Retrying for the same reason as the font: a one-shot read on a phone can land before the listing settles.
    await expect(add).toHaveCSS("background-color", "rgb(255, 255, 255)");

    // Layout boxes (offsetHeight/offsetTop), not boundingBox: the click's press and hover transforms
    // (scale .99, 2px lift) are still settling and would skew a transformed box.
    const box = () =>
      card.evaluate((el) => {
        const compare = el.querySelector('input[type="checkbox"]')?.closest("label") ?? el;
        return { height: (el as HTMLElement).offsetHeight, compareTop: (compare as HTMLElement).offsetTop };
      });
    // The baseline waits for a laid-out card: mid-stream the swapped-out fallback measures 0.
    await expect.poll(async () => (await box()).height).toBeGreaterThan(0);
    const before = await box();
    await add.click();
    await expect(card.getByText("In quote")).toBeVisible();
    const after = await box();
    expect(after.height).toBe(before.height);
    expect(after.compareTop).toBe(before.compareTop);
  });

  test("result count keeps its live region and changes with a filter", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is desktop; the sheet is covered in catalogue.spec.ts");
    await page.goto("/products/time-attendance", { waitUntil: "load" });
    const count = page.locator('p[aria-live="polite"]').filter({ hasText: /products?$/ });
    await expect(count).toHaveCount(1);
    const before = await count.textContent();
    await page.locator("#rail-verify-face").check();
    await expect(count).not.toHaveText(before ?? "");
    await expect(count).toHaveText(/^\d+ products?$/);
  });

  test("the filter rail stays in view while the grid scrolls", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is desktop only");
    await page.goto("/products", { waitUntil: "load" });
    const rail = page.getByRole("complementary", { name: "Filters" });
    await expect(rail).toHaveCSS("position", "sticky");
    await page.mouse.wheel(0, 2400);
    await expect.poll(async () => (await rail.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
    const box = await rail.boundingBox();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(900);
  });

  test("compare tray shows a thumbnail per pick", async ({ page, isMobile }) => {
    test.skip(isMobile, "tray chips are hidden on phones (count + action only)");
    await page.goto("/products/access-control?cmp=f18,bio-pro-sa20", { waitUntil: "load" });
    const tray = page.getByRole("region", { name: "Compare products" });
    await expect(tray.getByRole("listitem")).toHaveCount(2);
    await expect(tray.locator("li img")).toHaveCount(2);
    await expect(tray.locator("li img").first()).toHaveAttribute("alt", "");
  });
});

test.describe("compare polish", () => {
  test("desktop table: fixed layout, equal product columns", async ({ page, isMobile }) => {
    test.skip(isMobile, "phones get the stacked view");
    await page.goto("/products/compare?items=biopro-mh20,biopro-mh30", { waitUntil: "load" });
    const table = page.locator("table");
    await expect(table).toHaveCSS("table-layout", "fixed");
    const heads = table.locator("thead th");
    const [a, b] = [await heads.nth(0).boundingBox(), await heads.nth(1).boundingBox()];
    expect(Math.abs((a?.width ?? 0) - (b?.width ?? 1))).toBeLessThanOrEqual(1);
  });

  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: "Back to results" arrow points to the inline start`, async ({ page }) => {
      await page.goto(`${locale === "ar" ? "/ar" : ""}/products/compare?items=biopro-mh20,biopro-mh30`, {
        waitUntil: "load",
      });
      const back = page.getByRole("link", { name: locale === "ar" ? "العودة إلى النتائج" : "Back to results" });
      const arrow = back.locator("svg").first();
      const text = await back.evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el.lastChild ?? el);
        return r.getBoundingClientRect().x;
      });
      const icon = await arrow.boundingBox();
      // The arrow sits before the text in reading order: left in English, right in Arabic.
      if (locale === "en") expect(icon?.x ?? 0).toBeLessThan(text);
      else expect(icon?.x ?? 0).toBeGreaterThan(text);
      await expect(back).not.toContainText("←");
      // Net horizontal flip of the wrapper and the icon: ← (-1) in English, → (1) in Arabic.
      const flip = await arrow.evaluate((svg) => {
        const x = (el: Element) => Number.parseFloat(getComputedStyle(el).scale.split(" ")[0]) || 1;
        return x(svg) * (svg.parentElement ? x(svg.parentElement) : 1);
      });
      expect(flip).toBe(locale === "en" ? -1 : 1);
    });
  }
});
