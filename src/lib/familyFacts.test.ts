import { describe, expect, it } from "vitest";
import type { ProductCard } from "@/content/cards";
import { familyFacts } from "./familyFacts";

const card = (over: Partial<ProductCard>): ProductCard => ({
  slug: "x",
  name: "X",
  model: "X",
  brand: "zkteco",
  family: "time-attendance",
  types: [],
  verify: [],
  conn: [],
  outdoor: false,
  facts: [],
  image: null,
  keywords: "",
  ...over,
});

describe("familyFacts", () => {
  const cards = [
    card({ verify: ["face", "card"], types: ["portable"], outdoor: true }),
    card({ verify: ["face", "fingerprint"], brand: "alpha" }),
    card({ verify: ["card"] }),
  ];
  const facts = familyFacts(cards, ["portable", "panel"]);

  it("counts the cards", () => expect(facts.total).toBe(3));
  it("lists methods held by more than one model, in the fixed order", () =>
    expect(facts.verify).toEqual([
      { value: "face", count: 2 },
      { value: "card", count: 2 },
    ]));
  it("counts types and leaves out empty ones", () => expect(facts.types).toEqual([{ value: "portable", count: 1 }]));
  it("counts outdoor-rated models and brands", () => {
    expect(facts.outdoor).toBe(1);
    expect(facts.brands).toEqual([
      { value: "zkteco", count: 2 },
      { value: "alpha", count: 1 },
    ]);
  });
});
