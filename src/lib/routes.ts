/**
 * Route registry: the 35 designed routes from Master Plan v2.0 ch. 12.
 *
 * `status` drives CI: every "built" route must return 200 and pass axe;
 * navigation may only link to built routes, valid filtered states, or an
 * explicit external link. Flip a route to "built" in the same commit that
 * adds its page.
 *
 * Product pages are generated for all 159 live products from one template
 * (review decision 6); the six product entries below are the ones reviewed
 * by hand. Listings for all six families exist (three were added in the
 * build because the Products menu links every family).
 */

export type Template =
  | "T1 Home"
  | "T2 Hub"
  | "T3 Solution"
  | "T4 Listing"
  | "T5 Product"
  | "T6 Software"
  | "T7 Location"
  | "T8 Quote"
  | "T9 Contact"
  | "T10 Editorial";

export type RouteEntry = {
  path: string;
  title: string;
  template: Template;
  priority: "P0" | "P1" | "P2";
  status: "planned" | "built";
  /** Old aimsuae.me URL this route replaces (301), if any. */
  replaces?: string[];
};

export const ROUTES: RouteEntry[] = [
  // Core
  { path: "/", title: "Home", template: "T1 Home", priority: "P0", status: "built" },
  {
    path: "/products",
    title: "All products",
    template: "T4 Listing",
    priority: "P0",
    status: "built",
    replaces: ["/product"],
  },
  { path: "/solutions", title: "Solutions", template: "T2 Hub", priority: "P1", status: "built" },
  {
    path: "/software",
    title: "Software Download Centre",
    template: "T6 Software",
    priority: "P1",
    status: "built",
    replaces: ["/swcategory/*"],
  },
  { path: "/services", title: "Services", template: "T3 Solution", priority: "P1", status: "planned" },
  { path: "/locations", title: "Locations", template: "T2 Hub", priority: "P2", status: "planned" },
  { path: "/about", title: "About & showrooms", template: "T10 Editorial", priority: "P1", status: "planned" },
  {
    path: "/contact",
    title: "Contact",
    template: "T9 Contact",
    priority: "P1",
    status: "built",
    replaces: ["/enquiry", "/contact.html"],
  },
  {
    path: "/quote",
    title: "Quote list",
    template: "T8 Quote",
    priority: "P0",
    status: "built",
    replaces: ["/getaquote"],
  },
  {
    path: "/support",
    title: "Support & warranty",
    template: "T10 Editorial",
    priority: "P1",
    status: "planned",
    replaces: ["/zkteco-warranty-policy", "/faq"],
  },
  { path: "/privacy-policy", title: "Privacy", template: "T10 Editorial", priority: "P2", status: "planned" },
  { path: "/terms-and-conditions", title: "Terms", template: "T10 Editorial", priority: "P2", status: "planned" },
  { path: "/blog", title: "Blog", template: "T10 Editorial", priority: "P2", status: "planned" },
  {
    path: "/blog/how-to-choose-an-access-control-system-for-your-business-a-complete-guide-by-aims-security-systems-trading-llc",
    title: "How to choose an access control system",
    template: "T10 Editorial",
    priority: "P2",
    status: "planned",
  },

  // Solutions
  {
    path: "/solutions/time-attendance",
    title: "Time attendance",
    template: "T3 Solution",
    priority: "P0",
    status: "built",
  },
  {
    path: "/solutions/access-control",
    title: "Access control",
    template: "T3 Solution",
    priority: "P1",
    status: "built",
  },
  {
    path: "/solutions/entrance-parking",
    title: "Entrance & parking",
    template: "T3 Solution",
    priority: "P1",
    status: "built",
  },
  { path: "/solutions/door-locks", title: "Door locks", template: "T3 Solution", priority: "P1", status: "built" },
  { path: "/solutions/pos", title: "POS systems", template: "T3 Solution", priority: "P1", status: "built" },

  // Listings
  {
    path: "/products/time-attendance",
    title: "Time attendance products",
    template: "T4 Listing",
    priority: "P0",
    status: "built",
  },
  {
    path: "/products/entrance-control",
    title: "Entrance & parking products",
    template: "T4 Listing",
    priority: "P1",
    status: "built",
  },
  // Added in the build: same template; the Products menu links all six families.
  {
    path: "/products/access-control",
    title: "Access control products",
    template: "T4 Listing",
    priority: "P1",
    status: "built",
  },
  {
    path: "/products/door-locks",
    title: "Smart & hotel locks",
    template: "T4 Listing",
    priority: "P1",
    status: "built",
  },
  { path: "/products/pos", title: "POS systems", template: "T4 Listing", priority: "P2", status: "built" },
  // Review decision 3: compare as its own page, so Back returns to the same results.
  { path: "/products/compare", title: "Compare products", template: "T4 Listing", priority: "P0", status: "built" },
  {
    path: "/products/door-hardware",
    title: "Door hardware",
    template: "T4 Listing",
    priority: "P1",
    status: "built",
  },

  // Products (URLs unchanged)
  { path: "/product/f18", title: "ZKTeco F18", template: "T5 Product", priority: "P0", status: "built" },
  {
    path: "/product/bio-pro-sa20",
    title: "ZKTeco BioPro SA20",
    template: "T5 Product",
    priority: "P1",
    status: "built",
  },
  {
    path: "/product/zkteco-speedface-v5l-qr",
    title: "ZKTeco SpeedFace-V5L [QR]",
    template: "T5 Product",
    priority: "P1",
    status: "built",
  },
  {
    path: "/product/barrier-gates-bgm-1045",
    title: "Barrier BGM 1045",
    template: "T5 Product",
    priority: "P2",
    status: "built",
  },
  { path: "/product/al-m280", title: "Alpha AL-M280", template: "T5 Product", priority: "P1", status: "built" },
  { path: "/product/zkaio1000", title: "ZKTeco ZKAIO1000", template: "T5 Product", priority: "P2", status: "built" },

  // Software (URLs unchanged)
  { path: "/software/biotime-9-5", title: "BioTime 9.5", template: "T6 Software", priority: "P0", status: "built" },
  {
    path: "/software/biotimecloud",
    title: "BioTime Cloud",
    template: "T6 Software",
    priority: "P1",
    status: "built",
  },
  { path: "/software/zkaccess-3-5", title: "ZKAccess 3.5", template: "T6 Software", priority: "P1", status: "built" },

  // Locations (URLs unchanged)
  {
    path: "/zkteco-distributor-in-dubai",
    title: "ZKTeco distributor in Dubai",
    template: "T7 Location",
    priority: "P0",
    status: "planned",
  },
  {
    path: "/zkteco-distributor-in-oman",
    title: "ZKTeco distributor in Oman",
    template: "T7 Location",
    priority: "P1",
    status: "planned",
  },
  {
    path: "/zkteco-distributors-in-kenya",
    title: "ZKTeco distributors in Kenya",
    template: "T7 Location",
    priority: "P1",
    status: "planned",
  },
  { path: "/ar/zkteco-dubai", title: "ZKTeco دبي", template: "T7 Location", priority: "P1", status: "planned" },
];

export const builtRoutes = () => ROUTES.filter((r) => r.status === "built");
