import { describe, expect, it } from "vitest";
import type { Product, Software } from "@/content/schema";
import { listAfter, namesSoftware, splitFeature, typeFromParam } from "./software";

const software = (overview: Software["overview"]): Software => ({
  slug: "zkaccess-3-5",
  name: "ZKAccess 3.5",
  types: ["access-control"],
  summary: "",
  overview,
  image: null,
  delivery: "request",
  downloadUrl: null,
  sourceUrl: "https://aimsuae.me/software/zkaccess-3-5",
});

const product = (text: string, extra: Partial<Product> = {}): Product => ({
  slug: "p",
  name: "P",
  brand: "zkteco",
  model: "P",
  family: "access-control",
  sourceCategories: [],
  summary: "",
  overview: [{ type: "p", text }],
  specs: [],
  methods: [],
  connectivity: [],
  outdoor: false,
  images: [],
  datasheetUrl: null,
  sourceUrl: "https://aimsuae.me/product/p",
  ...extra,
});

describe("listAfter", () => {
  const s = software([
    { type: "h", text: "Key Features of ZKAccess" },
    { type: "p", text: "Intro" },
    { type: "ul", items: ["Users", "Doors"] },
    { type: "h", text: "System Capabilities" },
    { type: "ul", items: ["Supports up to 30,000 users"] },
  ]);
  it("returns the first list under a matching heading, skipping paragraphs between", () => {
    expect(listAfter(s, /key features/i)).toEqual(["Users", "Doors"]);
    expect(listAfter(s, /capabilities/i)).toEqual(["Supports up to 30,000 users"]);
  });
  it("returns nothing when the heading is missing, so the page shows no invented list", () => {
    expect(listAfter(s, /requirements/i)).toEqual([]);
  });
  it("stops at the next heading instead of borrowing another section's list", () => {
    const t = software([
      { type: "h", text: "Key Features" },
      { type: "h", text: "Other" },
      { type: "ul", items: ["x"] },
    ]);
    expect(listAfter(t, /key features/i)).toEqual([]);
  });
});

describe("splitFeature", () => {
  it("splits AIMS's 'Title: body' items", () => {
    expect(splitFeature("Real-Time Data Synchronization: Get instant updates.")).toEqual({
      title: "Real-Time Data Synchronization",
      body: "Get instant updates.",
    });
  });
  it("keeps a plain item whole", () => {
    expect(splitFeature("Leave management and overtime tracking")).toEqual({
      title: "Leave management and overtime tracking",
    });
  });
});

describe("namesSoftware", () => {
  it("finds BioTime and ZKBioTime but not BioTime 8.5 or BioTime Cloud", () => {
    expect(namesSoftware(product("Fully compatible with BioTime attendance software"), "biotime-9-5")).toBe(true);
    expect(namesSoftware(product("ZKBioTime / ZKBioSecurity"), "biotime-9-5")).toBe(true);
    expect(namesSoftware(product("ZKBioSecurity, BioTime 8.5, ZKBioAccess"), "biotime-9-5")).toBe(false);
    expect(namesSoftware(product("Works with BioTime Cloud"), "biotime-9-5")).toBe(false);
  });
  it("reads spec rows as well as overview text", () => {
    const p = product("", {
      specs: [{ title: "", rows: [{ label: "SDK and software", value: "Standalone SDK, ZKBio CVSecurity software" }] }],
    });
    expect(namesSoftware(p, "zkbio-cvsecurity")).toBe(true);
  });
  it("names nothing for software without published product links", () => {
    expect(namesSoftware(product("BioTime Cloud ready"), "biotimecloud")).toBe(false);
  });
});

describe("typeFromParam", () => {
  it("accepts the three software types used by the old /swcategory redirects", () => {
    expect(typeFromParam("time-attendance")).toBe("time-attendance");
    expect(typeFromParam("security-platform")).toBe("security-platform");
  });
  it("ignores anything else", () => {
    expect(typeFromParam("cloud")).toBeNull();
    expect(typeFromParam(null)).toBeNull();
  });
});
