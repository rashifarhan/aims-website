import { describe, expect, it } from "vitest";
import { destinationFromSearch, presetPatch, withDestination } from "./context";

describe("destination preset (Design Doc 10.1 T7)", () => {
  it("accepts only an export link to a market AIMS lists", () => {
    expect(destinationFromSearch("?need=export&country=Kenya")).toEqual({ need: "export", country: "Kenya" });
    expect(destinationFromSearch("?need=export&country=Oman")).toEqual({ need: "export", country: "Oman" });
    expect(destinationFromSearch("?need=install&country=Kenya")).toBeUndefined();
    expect(destinationFromSearch("?need=export&country=Atlantis")).toBeUndefined();
    expect(destinationFromSearch("?need=export")).toBeUndefined();
  });

  it("never overwrites a need the buyer already chose", () => {
    const oman = { need: "export", country: "Oman" } as const;
    expect(presetPatch(undefined, oman)).toEqual(oman);
    expect(presetPatch({ city: "Dubai" }, oman)).toEqual(oman);
    expect(presetPatch({ need: "supply" }, oman)).toBeUndefined();
    expect(presetPatch(undefined, undefined)).toBeUndefined();
  });
});

it("uses Dubai only on an explicit local installation link", () => {
  expect(destinationFromSearch("?need=install&emirate=dubai")).toEqual({ need: "install", emirate: "dubai" });
  expect(destinationFromSearch("?need=install")).toBeUndefined();
  expect(destinationFromSearch("?need=supply&emirate=dubai")).toBeUndefined();
});

describe("withDestination (market links)", () => {
  it("adds only a market preset, after any existing query", () => {
    expect(withDestination("/product/f18", { need: "export", country: "Kenya" })).toBe(
      "/product/f18?need=export&country=Kenya",
    );
    expect(withDestination("/products/access-control?cmp=f18", { need: "install", emirate: "dubai" })).toBe(
      "/products/access-control?cmp=f18&need=install&emirate=dubai",
    );
  });
  it("leaves the link alone without a market", () => {
    expect(withDestination("/product/f18", undefined)).toBe("/product/f18");
    expect(withDestination("/product/f18", { need: "supply" })).toBe("/product/f18");
    expect(withDestination("/product/f18", { need: "install", emirate: "sharjah" })).toBe("/product/f18");
  });
});
