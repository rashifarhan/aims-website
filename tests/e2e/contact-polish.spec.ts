import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { restMotion } from "./rest";

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
const axeClean = async (page: import("@playwright/test").Page) => {
  await settle(page);
  await restMotion(page);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

for (const path of ["/contact", "/ar/contact"]) {
  test(`T9 ${path}: content edges match the header and footer`, async ({ page }) => {
    await page.goto(path);
    const edges = await page
      .locator("header > div, main > section.co-contact > div.wrap, footer > div")
      .evaluateAll((boxes) =>
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

// The reach band became the reach globe with AIMS's published reviews (owner, 28 Nov 2026).
test("reach globe: loads as it comes into view, switches reviews, and stays axe-clean", async ({ page }) => {
  await page.goto("/contact");
  const band = page.getByRole("region", { name: "Where AIMS delivers, and what customers say" });
  const globe = band.locator(".rg-box");
  await expect(globe).toHaveAttribute("data-gl", "pending");
  await band.scrollIntoViewIfNeeded();
  await expect(globe).not.toHaveAttribute("data-gl", "pending");
  await band.getByRole("button", { name: /Abu Dhabi/ }).click();
  await expect(band.locator("figure")).toContainText("Traffic Burger Head Office");
  await axeClean(page);
});

test("reach globe under reduced motion: the review card does not animate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await expect(page.locator(".rg-card")).toHaveCSS("animation-name", "none");
});
