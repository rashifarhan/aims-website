import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/solutions/entrance-parking", moment: "word-highlight", h1: "Turnstiles and barriers in the UAE" },
  { path: "/solutions/door-locks", moment: "marquee-row", h1: "Smart and hotel locks in the UAE" },
  { path: "/solutions/pos", moment: "counter-rolls", h1: "POS terminals for shops in the UAE" },
] as const;

for (const p of PAGES) {
  // Master Plan 14 (T3) on the design skill: the dealt moment is mounted, and every tile's "see all"
  // link lands on a listing that shows the count it promised (CLAUDE.md §1, §6).
  test(`${p.path}: dealt moment mounts and tile links keep their counts`, async ({ page, isMobile }) => {
    test.skip(isMobile, "content check, one viewport is enough");
    await page.goto(p.path);
    await expect(page.locator("h1")).toHaveText(p.h1);
    await expect(page.locator(`[data-moment="${p.moment}"]`)).toHaveAttribute("data-moment-mounted", /.*/);
    const links = page.locator("#types .method-tiles__actions a.link");
    await expect(links).toHaveCount(3);
    for (const link of await links.all()) {
      const count = Number((await link.textContent())?.match(/\d+/)?.[0]);
      const href = (await link.getAttribute("href")) ?? "";
      const listing = await page.context().newPage();
      await listing.goto(href);
      await expect(listing.getByText(new RegExp(`^${count} products?$`)).first()).toBeVisible();
      await listing.close();
    }
  });

  test(`${p.path}: Arabic page is RTL with no sideways scroll`, async ({ page }) => {
    await page.goto(`/ar${p.path}`);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

// The marquee runs longer than 5 s, so it carries a pause button (WCAG 2.2.2, CLAUDE.md §3).
test("door locks marquee has a working pause button", async ({ page, isMobile }) => {
  // On a phone the marquee stands still (skill moments.md, the still rule), so it has no button.
  test.skip(isMobile, "the marquee is still on a phone");
  await page.goto("/solutions/door-locks");
  const marquee = page.locator('[data-moment="marquee-row"]');
  await marquee.scrollIntoViewIfNeeded();
  const pause = marquee.getByRole("button", { name: "Pause" });
  await pause.click();
  await expect(marquee).toHaveClass(/is-paused/);
});
