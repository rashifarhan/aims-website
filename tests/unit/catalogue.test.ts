import { describe, expect, it } from "vitest";
import productsJson from "../../content/products.json";
import type { Product } from "@/content/schema";
import { FAMILIES } from "@/content/taxonomy";
import { toCard } from "@/content/cards";
import { keyFacts } from "@/content/facts";
import { createIndex, searchSlugs, tokenize } from "@/lib/search";
import { activeFilterCount, applyFilters, facetCounts, parseFilters, serializeFilters } from "@/lib/filters";
import { compareRows } from "@/lib/compare";

const products = (productsJson as Product[]).filter((p) => !p.duplicateOf);
const bySlug = (s: string) => products.find((p) => p.slug === s)!;
const cards = products.map(toCard);
const familyNames = Object.fromEntries(FAMILIES.map((f) => [f.slug, f.name]));
const index = createIndex(cards, familyNames);
const search = (q: string) => searchSlugs(index, q) ?? [];

describe("card facts (verbatim, per family)", () => {
  it("F18 shows its first two documented facts for its family, unaltered", () => {
    const facts = keyFacts(bySlug("f18"));
    expect(facts).toEqual([
      { label: "Fingerprint capacity", value: "3000 Templates" },
      { label: "Communication", value: "RS232/485, TCP/IP, USB-host" },
    ]);
  });

  it("a controller leads with doors and readers", () => {
    expect(keyFacts(bySlug("inbio-pro-260")).map((f) => f.label)).toEqual(["Doors controlled", "Readers supported"]);
  });

  it("every fact value is copied exactly from the product's spec table", () => {
    for (const p of products) {
      const rows = p.specs.flatMap((g) => g.rows);
      for (const f of keyFacts(p)) expect(rows).toContainEqual(expect.objectContaining(f));
    }
  });

  it("product-page tiles fill to four with general rows", () => {
    expect(keyFacts(bySlug("f18"), 4).map((f) => f.label)).toEqual([
      "Fingerprint capacity",
      "Communication",
      "Transaction capacity",
      "Display",
    ]);
  });

  it("products without specs get no facts rather than filler", () => {
    const none = products.find((p) => !p.specs.length)!;
    expect(keyFacts(none)).toEqual([]);
  });
});

describe("search", () => {
  it("tokenizer joins neighbouring parts so model codes match however typed", () => {
    expect(tokenize("SpeedFace-V5L [QR]")).toEqual(
      expect.arrayContaining(["speedface", "v5l", "speedfacev5l", "v5lqr"]),
    );
  });

  it("AT-03: 'sa20' puts BioPro SA20 first", () => {
    expect(search("sa20")[0]).toBe("bio-pro-sa20");
    expect(search("SA-20")[0]).toBe("bio-pro-sa20");
  });

  it("finds F18 first by its model code", () => {
    expect(search("f18")[0]).toBe("f18");
  });

  it("AT-04: an unknown model returns nothing", () => {
    expect(search("XYZ-999")).toEqual([]);
  });

  it("every popular search in the footer returns results", () => {
    for (const q of ["F18", "SpeedFace-V5L", "Fingerprint", "EM lock", "Turnstile", "Hotel lock"]) {
      expect(search(q).length, q).toBeGreaterThan(0);
    }
  });

  it("'exit button' finds the Alpha exit button (AT-01 step)", () => {
    expect(search("exit button")).toContain("alf-b21-exit-button");
  });
});

describe("URL filter state", () => {
  it("round-trips and drops unknown values", () => {
    const s = parseFilters(
      new URLSearchParams("q=f18&verify=face,bogus&brand=zkteco&outdoor=1&cmp=f18,bio-pro-sa20&family=nope"),
    );
    expect(s).toMatchObject({ q: "f18", verify: ["face"], brand: ["zkteco"], outdoor: true, family: undefined });
    expect(serializeFilters(s)).toBe("?q=f18&brand=zkteco&verify=face&cmp=f18,bio-pro-sa20&outdoor=1");
  });

  it("caps compare at three products", () => {
    expect(parseFilters(new URLSearchParams("cmp=a,b,c,d")).cmp).toEqual(["a", "b", "c"]);
  });

  it("counts applied filters but not search or compare", () => {
    expect(activeFilterCount(parseFilters(new URLSearchParams("q=x&cmp=f18&verify=face,card&outdoor=1")))).toBe(3);
  });

  it("old category redirects land on non-empty listings", () => {
    const cases: [string, string][] = [
      ["access-control", "verify=face"],
      ["time-attendance", "type=portable"],
      ["entrance-control", "type=parking"],
      ["door-locks", "type=hotel"],
      ["door-hardware", "brand=alpha"],
    ];
    for (const [family, qs] of cases) {
      const s = parseFilters(new URLSearchParams(`${qs}&family=${family}`));
      expect(applyFilters(cards, s, null).length, `${family}?${qs}`).toBeGreaterThan(0);
    }
  });

  it("facet counts ignore the group's own selection", () => {
    const s = parseFilters(new URLSearchParams("family=time-attendance&verify=face"));
    const counts = facetCounts(cards, s, null, "verify");
    expect(counts.get("fingerprint")).toBeGreaterThan(0);
    expect(applyFilters(cards, s, null).every((c) => c.verify.includes("face"))).toBe(true);
  });
});

describe("compare", () => {
  it("F18 vs BioPro SA20: shared rows first, gaps explicit, differences flagged", () => {
    const rows = compareRows([bySlug("f18"), bySlug("bio-pro-sa20")]);
    const firstUnshared = rows.findIndex((r) => !r.shared);
    expect(rows.slice(0, firstUnshared).every((r) => r.shared)).toBe(true);
    expect(rows.slice(firstUnshared).every((r) => !r.shared)).toBe(true);

    // Same number written differently is not a difference.
    expect(rows.find((r) => r.label === "Fingerprint capacity")!.differs).toBe(false);

    const display = rows.find((r) => r.label === "Display")!;
    expect(display.values).toEqual(["TFT LCD Color Screen", "2.4-inch TFT LCD Color Screen"]);
    expect(display.differs).toBe(true);

    const card = rows.find((r) => r.label === "Card capacity")!;
    expect(card.values[0]).toBeNull(); // F18 doesn't list it
    expect(card.differs).toBe(true);

    expect(rows.find((r) => r.label === "Wiegand signal")?.hint).toBeTruthy();
  });
});
