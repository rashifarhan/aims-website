import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const axeClean = async (page: import("@playwright/test").Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

for (const path of ["/contact", "/ar/contact"]) {
  test(`T9 ${path}: content edges match the header and footer`, async ({ page }) => {
    await page.goto(path);
    const edges = await page.locator("header > div, main > div.wrap, footer > div").evaluateAll((boxes) =>
      boxes.map((box) => {
        const rect = box.getBoundingClientRect();
        const style = getComputedStyle(box);
        return { start: rect.left + parseFloat(style.paddingLeft), end: rect.right - parseFloat(style.paddingRight) };
      }),
    );
    expect(edges.length).toBeGreaterThanOrEqual(3);
    for (const edge of edges.slice(1)) {
      expect(Math.abs(edge.start - edges[0].start)).toBeLessThanOrEqual(1);
      expect(Math.abs(edge.end - edges[0].end)).toBeLessThanOrEqual(1);
    }
  });
}

test("each need names the published line that answers it", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("region", { name: "Sales and quotes" })).toContainText(
    "Answered on the mobile and WhatsApp line.",
  );
  await page.locator("label").filter({ hasText: "Software and setup" }).click();
  await expect(page.getByRole("region", { name: "Software and setup" })).toContainText(
    "Answered on the Dubai showroom line.",
  );
  await page.locator("label").filter({ hasText: "Showroom visit" }).click();
  await expect(page.getByRole("region", { name: "Showroom visit" })).toContainText(
    "Answered on the Dubai showroom line.",
  );
});

test("channel buttons share the one button: WhatsApp in its own colour, Call as the outline", async ({ page }) => {
  await page.goto("/contact");
  const panel = page.getByRole("region", { name: "Sales and quotes" });
  await expect(panel.getByRole("link", { name: /WhatsApp/ })).toHaveClass(/home-button-whatsapp/);
  await expect(panel.getByRole("link", { name: /Call/ })).toHaveClass(/home-button-outline/);
  for (const link of [panel.getByRole("link", { name: /WhatsApp/ }), panel.getByRole("link", { name: /Call/ })]) {
    const box = await link.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("SIGNAL: the reach band draws its routes once when it comes into view", async ({ page }) => {
  await page.goto("/contact");
  const band = page.getByRole("region", { name: "Where AIMS delivers" });
  await expect(band).toHaveAttribute("data-moment");
  await expect(band.getByRole("img", { name: /^Map: AIMS offices in Dubai and Abu Dhabi/ })).toBeAttached();
  await expect(band).not.toHaveAttribute("data-played");
  await band.scrollIntoViewIfNeeded();
  await expect(band).toHaveAttribute("data-played", "true");
  await expect(band.locator(".reach-route").last()).toHaveCSS("stroke-dashoffset", "0px", { timeout: 4000 });
  await axeClean(page);
});

test("SIGNAL under reduced motion: the map rests finished, nothing hidden", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await expect(page.locator("html")).not.toHaveAttribute("data-effects", "on");
  for (const route of await page.locator(".contact-reach .reach-route").all())
    await expect(route).toHaveCSS("stroke-dashoffset", "0px");
});
