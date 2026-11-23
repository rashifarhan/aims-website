import type { SolutionSlug } from "@/lib/nav";

type Anchor = "start" | "middle" | "end";

/** One solution on the hub's site plan: where it sits, where its name goes and the line from the hub. */
type SitePoint = {
  slug: SolutionSlug;
  x: number;
  y: number;
  label: { x: number; y: number; anchor: Anchor };
  line: string;
};

/** The site's controller node, in the plan's 800 × 500 viewBox; every line starts here. */
export const HUB = { x: 560, y: 220 } as const;

/**
 * A visit in order, from the gate to the counter (the link list follows it): entrance and parking at
 * the gate, the controlled main door, the attendance terminal at the staff entry, an office door's
 * lock and the shop counter. Positions only; nothing here is a model, a count or a claim (CLAUDE.md §1).
 */
export const SITE_POINTS: readonly SitePoint[] = [
  {
    slug: "entrance-parking",
    x: 230,
    y: 420,
    label: { x: 254, y: 426, anchor: "start" },
    line: "M560 220C430 236 300 300 230 420",
  },
  {
    slug: "access-control",
    x: 475,
    y: 396,
    label: { x: 499, y: 434, anchor: "start" },
    line: "M560 220C540 290 490 320 475 396",
  },
  {
    slug: "time-attendance",
    x: 726,
    y: 115,
    label: { x: 700, y: 82, anchor: "end" },
    line: "M560 220C640 214 700 170 726 115",
  },
  {
    slug: "door-locks",
    x: 420,
    y: 200,
    label: { x: 420, y: 146, anchor: "middle" },
    line: "M560 220C510 230 460 214 420 200",
  },
  {
    slug: "pos",
    x: 680,
    y: 286,
    label: { x: 680, y: 344, anchor: "middle" },
    line: "M560 220C610 224 650 250 680 286",
  },
];
