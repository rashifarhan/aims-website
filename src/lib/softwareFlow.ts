import type { Product } from "@/content/schema";
import { namesSoftware, type BuiltSoftware } from "./software";

/**
 * The home page's "how your records flow" diagram (client request, 24 Nov 2026). Every line in it is a fact from
 * AIMS's own data (CLAUDE.md §1): a terminal links to a platform only where its AIMS product text names that
 * platform (`namesSoftware`), and a platform links to an output only where its AIMS feature list states it.
 */

/** Top to bottom in the drawing: BioTime Cloud first, so the terminal lines never cross. */
export const FLOW_SOFTWARE = ["biotimecloud", "biotime-9-5", "zkaccess-3-5"] as const satisfies BuiltSoftware[];

/** Real AIMS terminals whose product pages name BioTime and/or ZKAccess: two attendance terminals and a panel. */
export const FLOW_TERMINALS = ["iface-990", "bio-pro-sa20", "inbio-260"] as const;

export type FlowOutput = "payroll" | "shifts" | "attendance" | "doors" | "permissions";

/**
 * Each output and the feature line, copied from content/software.json, that states it for each platform. The unit
 * test checks every line still appears in that platform's AIMS overview, so an import that drops one fails.
 */
export const FLOW_OUTPUTS: { key: FlowOutput; evidence: Partial<Record<BuiltSoftware, string>> }[] = [
  {
    key: "payroll",
    evidence: {
      biotimecloud: "Detailed attendance and payroll reports",
      "biotime-9-5":
        "Comprehensive Reports: Generate accurate attendance, payroll, and compliance reports with just a few clicks.",
    },
  },
  {
    key: "shifts",
    evidence: {
      biotimecloud: "Leave management and overtime tracking",
      "biotime-9-5":
        "Flexible Shift & Scheduling Management: Simplify complex work shifts, overtime, and leave management.",
    },
  },
  {
    key: "attendance",
    evidence: {
      biotimecloud: "Detailed attendance and payroll reports",
      "biotime-9-5":
        "Comprehensive Reports: Generate accurate attendance, payroll, and compliance reports with just a few clicks.",
      "zkaccess-3-5": "Integrated time attendance and reporting system",
    },
  },
  { key: "doors", evidence: { "zkaccess-3-5": "Real-time door monitoring and activity tracking" } },
  { key: "permissions", evidence: { "zkaccess-3-5": "User management and access permission control" } },
];

/** The platforms a terminal's own AIMS text names, in drawing order. */
export const terminalSoftware = (product: Product): BuiltSoftware[] =>
  FLOW_SOFTWARE.filter((slug) => namesSoftware(product, slug));

/** The platforms that state an output, in drawing order. */
export const outputSoftware = (output: FlowOutput): BuiltSoftware[] => {
  const evidence = FLOW_OUTPUTS.find((o) => o.key === output)?.evidence ?? {};
  return FLOW_SOFTWARE.filter((slug) => slug in evidence);
};

/** The outputs a platform states, in drawing order. */
export const softwareOutputs = (slug: BuiltSoftware): FlowOutput[] =>
  FLOW_OUTPUTS.filter((o) => slug in o.evidence).map((o) => o.key);

/**
 * Where a row's line meets the drawing, as a fraction of the diagram's height: n equal rows, each line at its
 * row's centre (the CSS gives every column the same height and equal rows).
 */
export const rowCentre = (index: number, rows: number) => (index + 0.5) / rows;
