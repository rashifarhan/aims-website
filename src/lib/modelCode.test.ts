import { describe, expect, it } from "vitest";
import products from "../../content/products.json";
import { splitModel } from "./modelCode";

describe("splitModel", () => {
  it.each([
    ["LH4000 Smart Hotel Door Lock", "LH4000", "Smart Hotel Door Lock"],
    [
      "TS1022 Pro Tripod Turnstile w/ controller and combination of fingerprint & RFID Reader",
      "TS1022 Pro",
      "Tripod Turnstile w/ controller and combination of fingerprint & RFID Reader",
    ],
    ["TS2000 Pro Series Tripod Turnstile", "TS2000 Pro Series", "Tripod Turnstile"],
    [
      "G3 Multi-Biometric Time Attendance & Access Control Terminal",
      "G3",
      "Multi-Biometric Time Attendance & Access Control Terminal",
    ],
    ["ZK-US10C-ID Time & Attendance Terminal", "ZK-US10C-ID", "Time & Attendance Terminal"],
    ["Inbio Pro 460 Package B", "Inbio Pro 460", "Package B"],
  ])("splits %s", (model, code, description) => {
    expect(splitModel(model)).toEqual({ code, description });
  });

  it.each([
    "Barrier Gates BGM 1045",
    "Door Contact",
    "SBT1000S Series",
    "Speedface V5L TI",
    "Barrier Gate Pro BG3000",
    "CR20E ZKTeco",
    "KR602 E/M",
  ])("keeps %s whole", (model) => {
    expect(splitModel(model)).toEqual({ code: model, description: "" });
  });

  it("loses no word of any imported model", () => {
    for (const { model } of products as { model: string }[]) {
      const { code, description } = splitModel(model);
      expect([code, description].filter(Boolean).join(" ")).toBe(model.trim().split(/\s+/).join(" "));
      expect(code.length).toBeGreaterThan(0);
    }
  });
});
