import { describe, expect, it } from "vitest";
import { productGrounds } from "./grounds";

describe("productGrounds", () => {
  it("alternates under the connects diagram", () => {
    expect(productGrounds({ connects: true, fitted: true })).toEqual({
      fitted: "band",
      specs: "paper",
      details: "band",
    });
  });

  it("never sets two light sections on one ground when data is missing", () => {
    expect(productGrounds({ connects: false, fitted: true })).toMatchObject({ fitted: "band", specs: "paper" });
    const bare = productGrounds({ connects: false, fitted: false });
    expect(bare).toMatchObject({ specs: "band", details: "paper" });
    expect(productGrounds({ connects: true, fitted: false })).toMatchObject({ specs: "band", details: "paper" });
  });
});
