import { describe, expect, it } from "vitest";
import pages from "../../content/pages.json";
import { articleDate, articleSolution, headingId, isSubheading, outline, publishableQuestions } from "./editorial";

describe("editorial outline", () => {
  it("gives each heading a stable, unique anchor", () => {
    expect(headingId(3, "Use of Information")).toBe("s3-use-of-information");
    expect(headingId(0, "؟")).toBe("s0");
    const blocks = [
      { type: "h" as const, text: "Scope" },
      { type: "p" as const, text: "…" },
      { type: "h" as const, text: "Scope" },
    ];
    expect(outline(blocks).map((h) => h.id)).toEqual(["s0-scope", "s2-scope"]);
  });
  it("keeps numbered subsections out of the index", () => {
    expect(isSubheading("3.1 Product Information")).toBe(true);
    expect(isSubheading("3. Products, Services & Orders")).toBe(false);
    const blocks = [
      { type: "h" as const, text: "3. Orders" },
      { type: "h" as const, text: "3.1 Acceptance" },
    ];
    expect(outline(blocks)).toEqual([{ id: "s0-3-orders", text: "3. Orders" }]);
  });
});

describe("support questions", () => {
  it("leaves out answerless items and the partner claim the claims policy replaces", () => {
    const shown = publishableQuestions(pages.support.faq.items as Parameters<typeof publishableQuestions>[0]);
    expect(shown.length).toBeGreaterThan(5);
    expect(shown.every((q) => q.answer.length > 0)).toBe(true);
    expect(JSON.stringify(shown)).not.toMatch(/strategic partner/i);
  });
});

describe("article dates", () => {
  it("formats the imported ISO date in the page language with Latin digits", () => {
    expect(articleDate("2026-11-18", "en")).toBe("18 November 2026");
    expect(articleDate("2026-11-18", "ar")).toMatch(/18/);
    expect(articleDate("2026-11-18", "ar")).toMatch(/2026/);
  });
});

describe("article to solution", () => {
  it("leads each article to the trade its slug names", () => {
    expect(articleSolution("how-to-choose-the-right-pos-system")).toBe("pos");
    expect(articleSolution("types-of-turnstile-gates-a-complete-guide-to-modern-access-control")).toBe(
      "entrance-parking",
    );
    expect(articleSolution("the-future-of-hr-cloud-based-time-attendance-systems-in-the-uae")).toBe("time-attendance");
    expect(articleSolution("what-is-rfid-access-control-and-how-does-it-work")).toBe("access-control");
    expect(articleSolution("tl-300")).toBe("door-locks");
    expect(articleSolution("zkteco-m6")).toBe("time-attendance");
    expect(articleSolution("zkteco-mars")).toBe("entrance-parking");
    expect(articleSolution("something-else")).toBeNull();
  });
  it("finds a trade for every imported article", () => {
    for (const a of pages.articles) expect(articleSolution(a.slug), a.slug).not.toBeNull();
  });
});
