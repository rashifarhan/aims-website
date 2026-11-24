import { describe, expect, it } from "vitest";
import type { ProductCard } from "@/content/cards";
import { parseFilters } from "./filters";
import { QUICK_PICKS, applyPreset, isPresetActive, quickPickCounts } from "./quickPicks";

const card = (slug: string, patch: Partial<ProductCard>): ProductCard => ({
  slug,
  name: slug,
  model: slug,
  brand: "zkteco",
  family: "access-control",
  types: [],
  verify: [],
  conn: [],
  outdoor: false,
  facts: [],
  image: null,
  keywords: "",
  ...patch,
});

const preset = (id: string) => QUICK_PICKS.find((p) => p.id === id)!.preset;

describe("quick picks", () => {
  it("lists the eight picks in the design-note order", () => {
    expect(QUICK_PICKS.map((p) => p.id)).toEqual([
      "face",
      "fingerprint",
      "turnstiles",
      "parking",
      "panels",
      "smart",
      "hotel",
      "pos",
    ]);
  });

  it("applyPreset replaces the filters, keeps search, sort and compare, and resets the page", () => {
    const before = parseFilters({
      q: "f18",
      sort: "name",
      page: "4",
      cmp: "f18,sa20",
      brand: "alpha",
      conn: "wifi",
      outdoor: "1",
      family: "pos",
    });
    const after = applyPreset(before, preset("turnstiles"));
    expect(after).toMatchObject({
      q: "f18",
      sort: "name",
      cmp: ["f18", "sa20"],
      page: 1,
      type: ["pedestrian"],
      brand: [],
      conn: [],
      verify: [],
      outdoor: false,
      family: undefined,
    });
  });

  it("the POS pick sets the family rather than a type", () => {
    expect(applyPreset(parseFilters({}), preset("pos"))).toMatchObject({ family: "pos", type: [] });
  });

  it("isPresetActive is true right after applyPreset and false once another filter is added", () => {
    const s = applyPreset(parseFilters({}), preset("face"));
    expect(isPresetActive(s, preset("face"))).toBe(true);
    expect(isPresetActive(s, preset("fingerprint"))).toBe(false);
    expect(isPresetActive({ ...s, conn: ["wifi"] }, preset("face"))).toBe(false);
    expect(isPresetActive({ ...s, q: "x", page: 3 }, preset("face"))).toBe(true);
  });

  it("counts each preset against the whole catalogue, with 0 for absent types", () => {
    const cards = [
      card("a", { verify: ["face"], types: ["panel"] }),
      card("b", { verify: ["face", "fingerprint"] }),
      card("c", { family: "pos", types: ["windows"] }),
    ];
    const counts = quickPickCounts(cards);
    expect(counts.get("face")).toBe(2);
    expect(counts.get("fingerprint")).toBe(1);
    expect(counts.get("panels")).toBe(1);
    expect(counts.get("pos")).toBe(1);
    expect(counts.get("hotel")).toBe(0);
  });
});
