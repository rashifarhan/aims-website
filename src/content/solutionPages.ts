import "server-only";
import type { SolutionSlug } from "@/lib/nav";
import type { FamilySlug } from "./taxonomy";
import type { Method } from "./schema";
import { productsInFamily } from "./catalogue";
import { SOLUTION_CARDS } from "./solutions";
import { TA_METHODS, TA_PRODUCTS, TA_SOFTWARE } from "./timeAttendance";

/*
 * T3 solution template API (Master Plan 12 #15–19, 14; Design Doc 10). Template: /solutions/time-attendance.
 *
 * A T3 page is a `<main id="main">` that composes sections in order. Shared sections live in
 * src/components/solution/ and take data + copy as props; none of them reads a page namespace, so a new
 * page never edits them. Page-specific sections (a story, a dealt moment) are ordinary children placed
 * between the shared ones: that is the slot. Put them, and any CSS they need, in
 * src/components/solution/<slug>/ and import that CSS from the page only (moment code loads lazily).
 *
 *   SolutionStage    {page, copy: IntroCopy}                         stage: word, product, h1, two actions, dive
 *   SolutionMethods  {idPrefix, page, copy: MethodsCopy}             verify-method guide → /products/<family>?verify=
 *   SolutionOptions  {idPrefix, copy: SectionCopy, items: Option[]}  any other option guide (types, sizes…)
 *   SolutionProducts {idPrefix, page, copy: ProductsCopy}            example products with Add to quote
 *   SolutionProcess  {idPrefix, copy: ProcessCopy}                   steps with owners, paper band
 *   SolutionSoftware {idPrefix, copy: SectionCopy, items}            built software → /software/<slug>, else ↗ aimsuae.me
 *   SolutionQuestions{idPrefix, copy: FaqCopy}                       native <details>
 *   ui/ClosePanel    {id, heading, body, action, secondary}          closing panel → page.quote + /products/<family>
 *
 * `idPrefix` (two letters, e.g. "ac") keeps heading ids unique: `${idPrefix}-products-title` etc.
 * Copy: one i18n namespace per page (solutionAccessControl…), en + ar, whose sub-objects match the
 * *Copy types below (src/components/solution/types.ts). Pass the sub-object; extra keys are fine.
 * Page CSS: shared section rules load from the layout (ui/sections.css); import solution.css only for its
 * family-only rules (story, option and pick cards).
 * A page with a `[data-moment]` section also renders <MomentTrigger /> (src/components/ui).
 * Data: define the page with `defineSolutionPage({...})`, here or in the page's own folder.
 */

/** One verification option: `key` picks the icon and the copy item, `match` the listing filter. */
export type MethodOption = { key: string; match: readonly Method[] };

export type SolutionPageData = {
  /** Route /solutions/<slug>; the breadcrumb uses t.solutions[slug].name. */
  slug: SolutionSlug;
  /** Listing /products/<family>; every count on the page comes from productsInFamily(family). */
  family: FamilySlug;
  /** Hero photograph: a product slug from content/products.json (the hub card's, so both pages match). */
  hero: string;
  /** Example products for SolutionProducts, in order: an editorial choice, not stock or sales data. */
  products: readonly string[];
  /** Verify-method guide for SolutionMethods; omit when the page has no method choice. */
  methods?: readonly MethodOption[];
  /** Software cards: slugs from content/software.json; kind and purpose are keys of the page's software copy. */
  software?: readonly { slug: string; kind: string; purpose: string }[];
  /** Where both quote actions go (Design Doc 12: the need is preset). */
  quote: string;
};

/** Identity helper so page data keeps its literal types (method keys, software copy keys). */
export const defineSolutionPage = <const T extends SolutionPageData>(page: T): T => page;

const heroOf = (slug: SolutionSlug) => SOLUTION_CARDS.find((card) => card.slug === slug)?.product ?? "";

export const SOLUTION_PAGES = {
  "time-attendance": defineSolutionPage({
    slug: "time-attendance",
    family: "time-attendance",
    hero: heroOf("time-attendance") || "f18",
    products: TA_PRODUCTS,
    methods: TA_METHODS,
    software: TA_SOFTWARE,
    quote: "/quote?need=install",
  }),
  "access-control": defineSolutionPage({
    slug: "access-control",
    family: "access-control",
    hero: heroOf("access-control") || "zkteco-speedface-v5l-qr",
    // Panels for one, two and four doors (spec "Doors controlled"), then a terminal for each method.
    products: ["inbio-pro-160", "c3-200", "inbio-pro-460", "speedface-v5l-p", "proface-x-p", "tf1700"],
    methods: [
      { key: "card", match: ["card"] },
      { key: "fingerprint", match: ["fingerprint"] },
      { key: "face", match: ["face"] },
      { key: "palm", match: ["palm"] },
    ],
    // Only software content/software.json files under access control (CLAUDE.md §1).
    software: [
      { slug: "zkbio-cvaccess", kind: "browser", purpose: "purposeCvaccess" },
      { slug: "zkbio-cvsecurity", kind: "browser", purpose: "purposeCvsecurity" },
    ],
    quote: "/quote?need=install",
  }),
} as const;

/** How many products in the family offer any of the option's methods (the listing's own rule). */
export function methodCount(family: FamilySlug, match: readonly Method[]): number {
  return productsInFamily(family).filter((p) => p.methods.some((m) => match.includes(m))).length;
}
