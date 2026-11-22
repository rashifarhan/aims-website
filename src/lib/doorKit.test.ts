import { describe, expect, it } from "vitest";
import { controllerFor, doorKitLines, stepKit } from "./doorKit";
import { productBySlug } from "@/content/catalogue";

describe("door kit", () => {
  it("picks the smallest InBio Pro panel that runs every door", () => {
    expect(controllerFor(1).slug).toBe("inbio-pro-160");
    expect(controllerFor(2).slug).toBe("inbio-pro-260");
    expect(controllerFor(3).slug).toBe("inbio-pro-460");
    expect(controllerFor(4).slug).toBe("inbio-pro-460");
    expect(controllerFor(9).slug).toBe("inbio-pro-460");
  });

  it("matches each panel to its catalogue 'Doors controlled' row (CLAUDE.md §1)", () => {
    for (const doors of [1, 2, 4]) {
      const row = productBySlug(controllerFor(doors).slug)
        ?.specs.flatMap((g) => g.rows)
        .find((r) => r.label === "Doors controlled");
      expect(row?.value).toMatch(new RegExp(`^${doors} Door`));
    }
  });

  it("adds one reader, lock and exit button a door and one card a user", () => {
    expect(doorKitLines(3, 40).map((l) => [l.slug, l.qty])).toEqual([
      ["kr602", 3],
      ["inbio-pro-460", 1],
      ["al-m280", 3],
      ["alf-b21-exit-button", 3],
      ["id-card-thin", 40],
    ]);
  });

  it("names only products the catalogue has", () => {
    for (const line of doorKitLines(4, 500)) expect(productBySlug(line.slug)).toBeDefined();
  });

  it("keeps counts within the kit's limits", () => {
    expect(doorKitLines(0, 3).map((l) => l.qty)).toEqual([1, 1, 1, 1, 10]);
    expect(stepKit("doors", 4, 1)).toBe(4);
    expect(stepKit("doors", 1, -1)).toBe(1);
    expect(stepKit("users", 20, 1)).toBe(30);
    expect(stepKit("users", 10, -1)).toBe(10);
    expect(stepKit("users", 500, 1)).toBe(500);
  });
});
