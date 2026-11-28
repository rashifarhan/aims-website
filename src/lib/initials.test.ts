import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("takes the first two words", () => expect(initials("Traffic Burger Head Office")).toBe("TB"));
  it("keeps a one-word name to one letter", () => expect(initials("Arjun")).toBe("A"));
  it("ignores extra spaces", () => expect(initials("  Sneha   Paul ")).toBe("SP"));
});
