import { describe, expect, it } from "vitest";
import { destinationFromSearch, presetPatch } from "./context";

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
