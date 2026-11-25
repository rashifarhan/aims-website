import { describe, expect, it } from "vitest";
import { pickStripItems } from "./modelStrip";

const catalogue = new Map([
  ["f18", { slug: "f18", model: "F18" }],
  ["lock", { slug: "lock", model: "LH4000 Smart Hotel Door Lock" }],
]);
const lookup = (slug: string) => catalogue.get(slug);

describe("pickStripItems", () => {
  it("keeps list order and uses the code part of the model", () => {
    expect(pickStripItems(lookup, ["lock", "f18"])).toEqual([
      { slug: "lock", code: "LH4000" },
      { slug: "f18", code: "F18" },
    ]);
  });
  it("skips slugs that are not in the catalogue", () => {
    expect(pickStripItems(lookup, ["nope", "f18"])).toEqual([{ slug: "f18", code: "F18" }]);
  });
});
