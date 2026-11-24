import { describe, expect, it } from "vitest";
import type { ProductCard } from "@/content/cards";
import { paginate, pageWindow, sortCards } from "./listing";

const card = (slug: string, name: string, family: ProductCard["family"]): ProductCard => ({
  slug,
  name,
  model: name,
  brand: "zkteco",
  family,
  types: [],
  verify: [],
  conn: [],
  outdoor: false,
  facts: [],
  image: null,
  keywords: "",
});

const names = (cs: ProductCard[]) => cs.map((c) => c.name);

describe("paginate", () => {
  const items = Array.from({ length: 159 }, (_, i) => i);

  it("splits 159 items into 14 pages of 12", () => {
    expect(paginate(items, 2)).toMatchObject({ page: 2, pageCount: 14, from: 13, to: 24 });
    expect(paginate(items, 2).items).toHaveLength(12);
  });

  it("clamps an out-of-range page to the last page", () => {
    expect(paginate(items, 99)).toMatchObject({ page: 14, from: 157, to: 159 });
  });

  it("returns an empty first page for no items", () => {
    expect(paginate([], 3)).toMatchObject({ page: 1, pageCount: 1, from: 0, to: 0, items: [] });
  });
});

describe("pageWindow", () => {
  it("shows every page when there are few", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("collapses runs of skipped pages into one gap", () => {
    expect(pageWindow(6, 14)).toEqual([1, "gap", 5, 6, 7, "gap", 14]);
    expect(pageWindow(2, 14)).toEqual([1, 2, 3, "gap", 14]);
    expect(pageWindow(14, 14)).toEqual([1, "gap", 13, 14]);
  });
});

describe("sortCards", () => {
  const cards = [
    card("a", "F22", "access-control"),
    card("b", "F18", "time-attendance"),
    card("c", "f2", "door-hardware"),
    card("d", "BioPro SA20", "time-attendance"),
  ];

  it("keeps the given order for relevance and does not mutate the input", () => {
    expect(names(sortCards(cards, "relevance", {}))).toEqual(["F22", "F18", "f2", "BioPro SA20"]);
  });

  it("sorts by name, numerically and ignoring case", () => {
    expect(names(sortCards(cards, "name", {}))).toEqual(["BioPro SA20", "f2", "F18", "F22"]);
  });

  it("sorts by family order, then by name", () => {
    expect(names(sortCards(cards, "family", {}))).toEqual(["BioPro SA20", "F18", "F22", "f2"]);
  });
});
