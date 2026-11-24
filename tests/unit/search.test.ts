import { describe, expect, it } from "vitest";
import type { ProductCard } from "@/content/cards";
import { closestSlugs, createIndex } from "@/lib/search";

const card = (slug: string, name: string): ProductCard => ({
  slug,
  name,
  model: name,
  brand: "zkteco",
  family: "time-attendance",
  types: [],
  verify: [],
  conn: [],
  outdoor: false,
  facts: [],
  image: null,
  keywords: "",
});

const index = createIndex([card("f18", "F18"), card("sa20", "BioPro SA20"), card("mh30", "Biopro MH30")], {
  "time-attendance": "Time attendance",
});

describe("closestSlugs", () => {
  it("finds a near-miss model code by a looser search", () => {
    expect(closestSlugs(index, "F19")).toContain("f18");
  });

  it("returns [] for a blank query", () => {
    expect(closestSlugs(index, "  ")).toEqual([]);
  });

  it("returns [] when nothing is close", () => {
    expect(closestSlugs(index, "XYZ-999")).toEqual([]);
  });

  it("returns at most the limit", () => {
    expect(closestSlugs(index, "biopro", 1)).toHaveLength(1);
  });
});
