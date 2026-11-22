import { describe, expect, it } from "vitest";
import type { ProductCard } from "@/content/cards";
import { FAMILIES } from "@/content/taxonomy";
import { applyFilters, defaultOrder, parseFilters } from "./filters";

const card = (slug: string, family: ProductCard["family"], complete: boolean): ProductCard => ({
  slug,
  name: slug,
  model: slug,
  brand: "zkteco",
  family,
  types: [],
  verify: [],
  conn: [],
  outdoor: false,
  facts: complete ? [{ label: "Doors", value: "2" }] : [],
  image: complete ? { src: `/${slug}.png`, width: 1, height: 1 } : null,
  keywords: "",
});

// Import order: incomplete cards first, families interleaved (what /products used to open on).
const cards = [
  card("hw-bare", "door-hardware", false),
  card("hw-full", "door-hardware", true),
  card("ta-bare", "time-attendance", false),
  card("ta-full-1", "time-attendance", true),
  card("ac-full", "access-control", true),
  card("ta-full-2", "time-attendance", true),
];

describe("default listing order (T5)", () => {
  it("puts cards with a photo and key facts first, families in FAMILIES order, import order within", () => {
    expect(defaultOrder(cards).map((c) => c.slug)).toEqual([
      "ta-full-1",
      "ta-full-2",
      "ac-full",
      "hw-full",
      "ta-bare",
      "hw-bare",
    ]);
  });

  it("only reorders: the same products appear, and the input is untouched", () => {
    const before = cards.map((c) => c.slug);
    const sorted = defaultOrder(cards);
    expect([...sorted.map((c) => c.slug)].sort()).toEqual([...before].sort());
    expect(cards.map((c) => c.slug)).toEqual(before);
  });

  it("a card missing only its photo, or only its facts, counts as incomplete", () => {
    const noPhoto = { ...card("no-photo", "time-attendance", true), image: null };
    const noFacts = { ...card("no-facts", "time-attendance", true), facts: [] };
    const full = card("full", "pos", true);
    expect(defaultOrder([noPhoto, noFacts, full]).map((c) => c.slug)).toEqual(["full", "no-photo", "no-facts"]);
  });

  it("applies with no search, and search relevance wins when there is one", () => {
    const none = parseFilters({});
    expect(applyFilters(cards, none, null)[0].slug).toBe("ta-full-1");
    expect(applyFilters(cards, none, ["hw-bare", "ac-full"]).map((c) => c.slug)).toEqual(["hw-bare", "ac-full"]);
  });

  it("keeps filtered views in the same order", () => {
    const s = parseFilters({ family: "time-attendance" });
    expect(applyFilters(cards, s, null).map((c) => c.slug)).toEqual(["ta-full-1", "ta-full-2", "ta-bare"]);
  });

  it("ranks every family", () => {
    const one = FAMILIES.map((f) => card(f.slug, f.slug, true)).reverse();
    expect(defaultOrder(one).map((c) => c.family)).toEqual(FAMILIES.map((f) => f.slug));
  });
});
