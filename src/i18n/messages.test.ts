import { describe, expect, it } from "vitest";
import en from "./messages/en.json";
import ar from "./messages/ar.json";

const keys = (o: object, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

describe("dictionaries", () => {
  it("Arabic has exactly the English keys", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });

  it("has no empty strings", () => {
    const values = (o: object): string[] => Object.values(o).flatMap((v) => (typeof v === "string" ? [v] : values(v)));
    expect([...values(en), ...values(ar)].filter((v) => !v.trim())).toEqual([]);
  });
});
