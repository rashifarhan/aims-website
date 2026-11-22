import { expect, test } from "@playwright/test";

// Pages whose imported overview or spec values carry long unbroken words (audit T1).
const LONG_WORD_PAGES = [
  "biopro-mh20",
  "c3-400",
  "ec10",
  "g2",
  "gl300",
  "inbio-pro-460-package-b",
  "sc405",
  "sf300",
  "tf1700",
  "x8-bt",
  "zkteco-kr500-m-rfid-reader",
  "zkteco-lh6500-door-lock",
];

test.describe("product page (T5)", () => {
  test("no page scrolls sideways at 390px, in English or Arabic (T1)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const slug of LONG_WORD_PAGES) {
      for (const prefix of ["", "/ar"]) {
        await page.goto(`${prefix}/product/${slug}`);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${prefix}/product/${slug}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("English product data keeps its order on Arabic pages (G4)", async ({ page }) => {
    await page.goto("/ar/product/f18");
    await expect(page.locator("h1 [lang='en'][dir='ltr']")).toHaveText("ZKTeco F18");
    const value = page.locator("#specs ~ * td [dir='ltr']").first();
    await expect(value).toHaveAttribute("lang", "en");
    await expect(page.getByRole("region", { name: "المواصفات الرئيسية" }).locator("[dir='ltr']").first()).toBeVisible();
    // Spec hints are translated, not left in English.
    await expect(page.getByText("ملحقات الباب التي يشغّلها الجهاز مباشرةً", { exact: false })).toBeVisible();
  });

  test("'How it connects' draws only what the product's own data lists", async ({ page }) => {
    await page.goto("/product/f18");
    const section = page.getByRole("region", { name: "How it connects" });
    const nodes = section.locator("dd");
    await expect(nodes).toHaveText([
      "TCP/IP (network)",
      "RS485",
      "USB",
      "Wiegand",
      /3rd Party Electric Lock/,
      "Door Sensor",
      "Exit Button",
      "Alarm",
      "Doorbell",
    ]);
    await expect(section.locator("path.connects-line").first()).toBeAttached();
    // The moment plays once the diagram is in view (MomentTrigger), then rests drawn.
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("[data-moment]")).toHaveAttribute("data-played", "true");

    await page.goto("/product/kr600");
    await expect(page.getByRole("region", { name: "How it connects" })).toHaveCount(0);
  });

  test("repeat add announces the new total; plurals read correctly (T2)", async ({ page }) => {
    await page.goto("/product/f18");
    const add = page.getByRole("button", { name: "Add to quote" }).first();
    await add.click();
    const live = page.getByRole("status").filter({ hasText: "In quote" });
    await expect(live).toContainText("ZKTeco F18 added to quote. Quantity: 1");
    await add.click();
    await expect(live).toContainText("ZKTeco F18: quantity 2");
    await expect(live).not.toContainText("units");
  });

  test("fitted items are cards with the outline Add; text links are 44px targets (T2, T3)", async ({ page }) => {
    await page.goto("/product/f18");
    const fitted = page.getByRole("region", { name: "Often fitted with" });
    const cards = fitted.getByRole("listitem");
    await expect(cards.first()).toHaveClass(/ui-card-interactive/);
    for (const button of await fitted.getByRole("button", { name: "Add to quote" }).all())
      await expect(button).toHaveClass(/home-button-outline/);

    const compare = page.getByRole("link", { name: "Compare with similar models" });
    const box = await compare.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
