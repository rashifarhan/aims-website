import { describe, expect, it } from "vitest";
import { EMPTY_QUOTE, MAX_QTY, QUOTE_TTL_MS, parseStored, quoteReducer, type QuoteAction } from "./store";

const run = (...actions: QuoteAction[]) => actions.reduce((s, a) => quoteReducer(s, a, 1000), EMPTY_QUOTE);

describe("quote reducer", () => {
  it("AT-01 shape: three products with their quantities", () => {
    const s = run(
      { type: "add", slug: "f18", qty: 12 },
      { type: "add", slug: "al-m280", qty: 12 },
      { type: "add", slug: "alf-b21-exit-button", qty: 12 },
    );
    expect(s.lines).toEqual([
      { kind: "product", slug: "f18", qty: 12 },
      { kind: "product", slug: "al-m280", qty: 12 },
      { kind: "product", slug: "alf-b21-exit-button", qty: 12 },
    ]);
  });

  it("adding an existing product increases its quantity", () => {
    expect(run({ type: "add", slug: "f18", qty: 2 }, { type: "add", slug: "f18", qty: 3 }).lines).toEqual([
      { kind: "product", slug: "f18", qty: 5 },
    ]);
  });

  it("clamps quantities to 1…9999", () => {
    const s = run({ type: "add", slug: "f18", qty: 0 }, { type: "add", slug: "x", qty: 1e9 });
    expect(s.lines.map((l) => l.qty)).toEqual([1, MAX_QTY]);
    expect(quoteReducer(s, { type: "setQty", key: "f18", qty: -4 }).lines[0].qty).toBe(1);
  });

  it("AT-04: 'Ask us about this model' adds a text line; blank text is ignored", () => {
    const s = run(
      { type: "addCustom", id: "c1", text: "  XYZ-999  ", qty: 1 },
      { type: "addCustom", id: "c2", text: " ", qty: 1 },
    );
    expect(s.lines).toEqual([{ kind: "custom", id: "c1", text: "XYZ-999", qty: 1 }]);
  });

  it("removes by key and clears", () => {
    const s = run(
      { type: "add", slug: "f18", qty: 1 },
      { type: "add", slug: "al-m280", qty: 1 },
      { type: "remove", key: "f18" },
    );
    expect(s.lines).toHaveLength(1);
    expect(quoteReducer(s, { type: "clear" }).lines).toEqual([]);
  });
});

describe("stored quote", () => {
  const stored = JSON.stringify({ v: 1, updatedAt: 0, lines: [{ kind: "product", slug: "f18", qty: 2 }] });

  it("restores a valid quote", () => {
    expect(parseStored(stored, 1000).lines).toHaveLength(1);
  });

  it("expires after 14 days", () => {
    expect(parseStored(stored, QUOTE_TTL_MS + 1)).toEqual(EMPTY_QUOTE);
  });

  it("treats corrupt or foreign data as empty", () => {
    expect(parseStored("{not json", 0)).toEqual(EMPTY_QUOTE);
    expect(parseStored(JSON.stringify({ v: 2, lines: [] }), 0)).toEqual(EMPTY_QUOTE);
  });
});
