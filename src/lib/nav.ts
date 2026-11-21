/**
 * Navigation model shared by the header, mobile menu and footer. Every
 * entry is a route in src/lib/routes.ts, a family listing, or a filtered
 * /products state (checked in nav.test.ts).
 */
import { FAMILIES, type FamilySlug } from "@/content/taxonomy";

export const SOLUTIONS = ["time-attendance", "access-control", "entrance-parking", "door-locks", "pos"] as const;
export type SolutionSlug = (typeof SOLUTIONS)[number];

export const familyPath = (slug: FamilySlug) => `/products/${slug}`;
export const solutionPath = (slug: SolutionSlug) => `/solutions/${slug}`;
export const FAMILY_SLUGS = FAMILIES.map((f) => f.slug);

export const SOFTWARE_LINKS = [
  { path: "/software/biotime-9-5", label: "BioTime 9.5" },
  { path: "/software/biotimecloud", label: "BioTime Cloud" },
  { path: "/software/zkaccess-3-5", label: "ZKAccess 3.5" },
] as const;

/** Model codes people search for; each opens a filtered listing. */
export const POPULAR_SEARCHES = ["F18", "SpeedFace-V5L", "BioTime", "EM lock", "Turnstile", "Hotel lock"] as const;
export const searchPath = (q: string) => `/products?q=${encodeURIComponent(q)}`;
