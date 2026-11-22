import { describe, expect, it } from "vitest";
import { highlightMatches, searchSuggestions, type SearchEntry } from "./searchSuggestions";
const entries: SearchEntry[] = [
  { label: "Access control", href: "/products/access-control", kind: "solution", keywords: "SA20 compatible models" },
  { label: "BioPro SA20", href: "/product/bio-pro-sa20", kind: "product", keywords: "fingerprint التحكم" },
  { label: "BioTime Cloud", href: "/software/biotimecloud", kind: "software", keywords: "attendance" },
];
describe("header suggestions", () => {
  it("ranks model names above category keywords, ignoring case", () =>
    expect(searchSuggestions(entries, "sa20")[0].label).toBe("BioPro SA20"));
  it("searches software and translated terms locally", () => {
    expect(searchSuggestions(entries, "cloud")[0].kind).toBe("software");
    expect(searchSuggestions(entries, "التحكم")[0].kind).toBe("product");
  });
  it("requires every word and handles empty/missing queries", () => {
    expect(searchSuggestions(entries, " SA20 fingerprint ")).toHaveLength(1);
    expect(searchSuggestions(entries, "SA20 cloud")).toEqual([]);
    expect(searchSuggestions(entries, "  ")).toEqual([]);
  });
  it("highlights literal input without treating punctuation as regex", () => {
    expect(highlightMatches("SpeedFace [QR]", "[QR]")).toEqual([
      { text: "SpeedFace ", match: false },
      { text: "[QR]", match: true },
    ]);
  });
});
