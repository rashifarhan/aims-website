import { describe, expect, it } from "vitest";
import { DOOR_BEATS, doorStep } from "./doorStep";

describe("doorStep", () => {
  it("starts on the credential, before and at the first beat", () => {
    expect(doorStep(-1)).toBe(1);
    expect(doorStep(0)).toBe(1);
  });

  it("moves to each part as its beat starts", () => {
    expect(doorStep(0.99)).toBe(1);
    expect(doorStep(1)).toBe(2);
    expect(doorStep(2)).toBe(3);
    expect(doorStep(3)).toBe(4);
    expect(doorStep(5.79)).toBe(5);
    expect(doorStep(5.8)).toBe(6);
  });

  it("singles out no part once the door rests verified", () => {
    expect(doorStep(DOOR_BEATS[6])).toBe(0);
    expect(doorStep(99)).toBe(0);
  });
});
