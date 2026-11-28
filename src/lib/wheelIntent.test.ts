import { describe, expect, it } from "vitest";
import { isFreshInput } from "./wheelIntent";

describe("isFreshInput", () => {
  it("reads a dying glide as the same gesture", () => {
    const glide = Array.from({ length: 30 }, (_, i) => 40 * Math.exp(-i / 10));
    expect(isFreshInput(glide)).toBe(false);
  });
  it("reads a mouse wheel still turning as fresh input", () => {
    expect(isFreshInput(Array.from({ length: 20 }, () => 90))).toBe(true);
  });
  it("reads a new stroke over the end of a glide as fresh input", () => {
    const glide = Array.from({ length: 24 }, (_, i) => 40 * Math.exp(-i / 6));
    expect(isFreshInput([...glide, 8, 16, 26, 34, 40, 44])).toBe(true);
  });
  it("waits for enough input to judge", () => {
    expect(isFreshInput([90, 90, 90])).toBe(false);
  });
});
