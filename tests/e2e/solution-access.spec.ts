import { expect, test } from "@playwright/test";

const storedLines = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("aims.quote.v1") ?? '{"lines":[]}').lines as {
        kind: string;
        slug?: string;
        qty: number;
      }[],
  );

// Design Doc 10, FIG 10.7 and 8.4: doors drive the panel (announced), one action adds the kit.
test("kit builder switches the panel with the doors and adds the kit to the quote", async ({ page }) => {
  await page.goto("/solutions/access-control");
  const kit = page.locator("#kit");
  const moreDoors = kit.getByRole("button", { name: "More doors" });
  // The builder answers once hydrated; retry the first press until then.
  await expect(async () => {
    await moreDoors.click();
    await expect(kit.locator("p[role=status]")).toHaveText("Controller changed to Inbio Pro 260", { timeout: 500 });
  }).toPass();
  await moreDoors.click();
  await expect(kit.locator("p[role=status]")).toHaveText("Controller changed to Inbio Pro 460");
  await expect(moreDoors).toBeEnabled();
  await moreDoors.click();
  await expect(moreDoors).toBeDisabled();
  await kit.getByRole("button", { name: "More users" }).click();
  await kit.getByRole("button", { name: "Add kit to quote" }).click();
  await expect(kit.locator("p[role=status]")).toHaveText("Kit added: 6 lines in your quote");
  const lines = await storedLines(page);
  expect(lines.filter((l) => l.kind === "product").map((l) => [l.slug, l.qty])).toEqual([
    ["kr602", 4],
    ["inbio-pro-460", 1],
    ["al-m280", 4],
    ["alf-b21-exit-button", 4],
    ["id-card-thin", 30],
  ]);
  expect(lines.filter((l) => l.kind === "custom")).toHaveLength(1);
  await kit.getByRole("link", { name: "Review your quote" }).click();
  await expect(page).toHaveURL(/\/quote$/);
});

test("kit builder works by keyboard alone", async ({ page }) => {
  await page.goto("/solutions/access-control");
  const fewer = page.getByRole("button", { name: "Fewer users" });
  await expect(async () => {
    await fewer.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#kit output").nth(1)).toHaveText("10", { timeout: 500 });
  }).toPass();
  await expect(fewer).toBeDisabled();
  await page.getByRole("button", { name: "Add kit to quote" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#kit p[role=status]")).toHaveText("Kit added: 6 lines in your quote");
});

// Design Doc 8.2 (reduced motion): every part and label visible, the door open, access granted.
test("reduced motion shows the door kit's finished frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/solutions/access-control");
  const story = page.locator("[data-door-story]");
  await expect(story).toHaveAttribute("data-story-live", "still");
  for (const part of [".door-reader", ".door-controller", ".door-lock", ".door-exit", ".door-software"])
    await expect(story.locator(part)).toHaveCSS("opacity", "1");
  await expect(story.locator(".door-granted")).toHaveCSS("opacity", "1");
  await expect(story.getByRole("listitem")).toHaveCount(6);
});

test("Arabic access control page is RTL with its own words and LTR model codes", async ({ page }) => {
  await page.goto("/ar/solutions/access-control");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("h1")).toHaveText("التحكم في الدخول لأبواب الإمارات");
  await expect(page.locator("#how a[dir='ltr']").first()).toHaveText("KR602 E/M");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
