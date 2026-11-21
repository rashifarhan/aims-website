import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import products from "../../content/products.json";
import software from "../../content/software.json";
import { ProductSchema, SoftwareSchema } from "./schema";
import { ROUTES } from "@/lib/routes";

describe("imported content", () => {
  it("every product and software record matches the schema", () => {
    expect(products.map((p) => ProductSchema.safeParse(p).success).every(Boolean)).toBe(true);
    expect(software.map((s) => SoftwareSchema.safeParse(s).success).every(Boolean)).toBe(true);
  });

  it("has the full AIMS catalogue", () => {
    expect(products.length).toBe(162);
    expect(software.length).toBe(8);
  });

  it("slugs are unique", () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it("every image file exists in /public", () => {
    const missing = products.flatMap((p) => p.images).filter((i) => !existsSync(path.join("public", i.src)));
    expect(missing).toEqual([]);
  });

  it("every product and software page in the route registry exists in the content", () => {
    const slugs = new Set(products.filter((p) => !("duplicateOf" in p)).map((p) => p.slug));
    const sw = new Set(software.map((s) => s.slug));
    const missing = ROUTES.map((r) => r.path).filter(
      (p) =>
        (p.startsWith("/product/") && !slugs.has(p.slice(9))) || (p.startsWith("/software/") && !sw.has(p.slice(10))),
    );
    expect(missing).toEqual([]);
  });
});
