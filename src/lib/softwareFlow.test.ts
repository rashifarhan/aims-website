import { describe, expect, it } from "vitest";
import productsJson from "../../content/products.json";
import softwareJson from "../../content/software.json";
import type { Product, Software } from "@/content/schema";
import {
  FLOW_OUTPUTS,
  FLOW_SOFTWARE,
  FLOW_TERMINALS,
  outputSoftware,
  rowCentre,
  softwareOutputs,
  terminalSoftware,
} from "./softwareFlow";

const products = productsJson as Product[];
const software = softwareJson as Software[];
const product = (slug: string) => {
  const found = products.find((p) => p.slug === slug);
  if (!found) throw new Error(`missing product ${slug}`);
  return found;
};
const features = (slug: string) =>
  (software.find((s) => s.slug === slug)?.overview ?? []).flatMap((b) => (b.type === "ul" ? b.items : []));

describe("software flow data (CLAUDE.md §1: every line is stated by AIMS)", () => {
  it("states every output with a feature line AIMS publishes for that platform", () => {
    for (const { key, evidence } of FLOW_OUTPUTS) {
      for (const [slug, line] of Object.entries(evidence)) {
        expect(features(slug), `${key} for ${slug}`).toContain(line);
      }
    }
  });

  it("links each terminal only to the platforms its own product text names", () => {
    expect(terminalSoftware(product("iface-990"))).toEqual(["biotime-9-5"]);
    expect(terminalSoftware(product("bio-pro-sa20"))).toEqual(["biotime-9-5", "zkaccess-3-5"]);
    expect(terminalSoftware(product("inbio-260"))).toEqual(["zkaccess-3-5"]);
    // No AIMS product page names BioTime Cloud, so no terminal photo links to it.
    for (const slug of FLOW_TERMINALS) expect(terminalSoftware(product(slug))).not.toContain("biotimecloud");
  });

  it("never claims payroll or door events for a platform that doesn't state them", () => {
    expect(outputSoftware("payroll")).toEqual(["biotimecloud", "biotime-9-5"]);
    expect(outputSoftware("doors")).toEqual(["zkaccess-3-5"]);
    expect(softwareOutputs("zkaccess-3-5")).toEqual(["attendance", "doors", "permissions"]);
    expect(FLOW_SOFTWARE.every((slug) => softwareOutputs(slug).length > 0)).toBe(true);
  });

  it("puts each line at its row's centre", () => {
    expect(rowCentre(0, 4)).toBe(0.125);
    expect(rowCentre(2, 5)).toBe(0.5);
  });
});
