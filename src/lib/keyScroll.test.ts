import { describe, expect, it } from "vitest";
import { keyDistance, keyIntent } from "./keyScroll";

const press = (
  key: string,
  mods: Partial<{ shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean }> = {},
) => keyIntent({ key, shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, ...mods });

describe("keyIntent", () => {
  it("maps the page-scroll keys", () => {
    expect(press("ArrowDown")).toEqual({ kind: "by", direction: 1, size: "line" });
    expect(press("ArrowUp")).toEqual({ kind: "by", direction: -1, size: "line" });
    expect(press("PageDown")).toEqual({ kind: "by", direction: 1, size: "page" });
    expect(press("PageUp")).toEqual({ kind: "by", direction: -1, size: "page" });
    expect(press(" ")).toEqual({ kind: "by", direction: 1, size: "page" });
    expect(press(" ", { shiftKey: true })).toEqual({ kind: "by", direction: -1, size: "page" });
    expect(press("Home")).toEqual({ kind: "to", edge: "start" });
    expect(press("End")).toEqual({ kind: "to", edge: "end" });
  });
  it("leaves other keys and modified presses to the browser", () => {
    expect(press("Tab")).toBeNull();
    expect(press("ArrowLeft")).toBeNull();
    expect(press("ArrowDown", { shiftKey: true })).toBeNull();
    expect(press("End", { shiftKey: true })).toBeNull();
    expect(press("PageDown", { ctrlKey: true })).toBeNull();
    expect(press("ArrowDown", { metaKey: true })).toBeNull();
    expect(press("Home", { altKey: true })).toBeNull();
  });
});

describe("keyDistance", () => {
  it("moves a line by 120px and a page by the screen less the header and an overlap", () => {
    expect(keyDistance("line", 900, 73)).toBe(120);
    expect(keyDistance("page", 900, 73)).toBe(763);
    expect(keyDistance("page", 150, 73)).toBe(120);
  });
});
