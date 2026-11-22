import { describe, expect, it } from "vitest";
import type { Block } from "@/content/schema";
import { groupQuestions, headingId, outline, withoutFoundingYear } from "./editorial";

describe("headingId", () => {
  it("makes a stable, unique anchor from the heading text and its position", () => {
    expect(headingId(3, "1. Information We Collect")).toBe("s3-1-information-we-collect");
    expect(headingId(0, "Hardware Warranty")).toBe("s0-hardware-warranty");
  });
  it("falls back to the position when the text has no latin letters or digits", () => {
    expect(headingId(7, "—")).toBe("s7");
  });
});

describe("outline", () => {
  const blocks: Block[] = [
    { type: "p", text: "Intro" },
    { type: "h", text: "1. Scope" },
    { type: "ul", items: ["a"] },
    { type: "h", text: "2. Use" },
  ];
  it("lists each heading with the same id the rendered heading gets", () => {
    expect(outline(blocks)).toEqual([
      { id: headingId(1, "1. Scope"), text: "1. Scope" },
      { id: headingId(3, "2. Use"), text: "2. Use" },
    ]);
  });
  it("is empty when a page has no headings, so no index is shown", () => {
    expect(outline([{ type: "p", text: "Only text" }])).toEqual([]);
  });
});

describe("groupQuestions", () => {
  it("pairs each question heading with the answer blocks that follow it", () => {
    const blocks: Block[] = [
      { type: "h", text: "1. Where?" },
      { type: "p", text: "Here." },
      { type: "ul", items: ["x", "y"] },
      { type: "h", text: "2. How?" },
      { type: "p", text: "Like this." },
    ];
    const groups = groupQuestions(blocks);
    expect(groups.map((g) => g.question)).toEqual(["1. Where?", "2. How?"]);
    expect(groups[0].answer).toHaveLength(2);
  });
  it("ignores text before the first question", () => {
    expect(groupQuestions([{ type: "p", text: "Preface" }])).toEqual([]);
  });
});

describe("withoutFoundingYear", () => {
  it("drops the sentence that states a founding year, which AIMS has not confirmed", () => {
    const text =
      "AIMS is a leading distributor in UAE. Company is established in 2011, having gained reputation. We are integrated.";
    expect(withoutFoundingYear(text)).toBe("AIMS is a leading distributor in UAE. We are integrated.");
  });
  it("leaves text without a founding year unchanged", () => {
    expect(withoutFoundingYear("Plain text.")).toBe("Plain text.");
  });
});
