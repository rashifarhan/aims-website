/**
 * Product taxonomy: 6 families replace the 16 overlapping categories on
 * aimsuae.me (Master Plan A10). Each old category maps to one family, or to
 * a filtered "all products" view when it is a brand umbrella.
 */

export const FAMILIES = [
  {
    slug: "time-attendance",
    name: "Time attendance",
    summary: "Fingerprint, face and card terminals for recording working hours.",
  },
  {
    slug: "access-control",
    name: "Access control",
    summary: "Door readers, controllers and panels for securing rooms and buildings.",
  },
  {
    slug: "entrance-control",
    name: "Entrance & parking",
    summary: "Turnstiles, speed gates, swing gates and parking barriers.",
  },
  {
    slug: "door-locks",
    name: "Smart & hotel locks",
    summary: "Smart locks for homes and offices, and RFID locks for hotels.",
  },
  {
    slug: "door-hardware",
    name: "Door hardware & accessories",
    summary: "EM locks, exit buttons, brackets, cards, power supplies and readers.",
  },
  {
    slug: "pos",
    name: "POS systems",
    summary: "Windows and Android point-of-sale terminals and peripherals.",
  },
] as const;

export type FamilySlug = (typeof FAMILIES)[number]["slug"];

/**
 * Old aimsuae.me category slug → family. The order of keys is also the
 * priority used when a product sits in several categories: the first
 * matching (most specific) category decides its primary family.
 */
export const CATEGORY_TO_FAMILY: Record<string, FamilySlug | null> = {
  "hotel-door-lock-system": "door-locks",
  "smart-lock": "door-locks",
  "parking-management": "entrance-control",
  "entrance-control": "entrance-control",
  "pos-windows": "pos",
  android: "pos",
  "zkteco-pos": "pos",
  "portable-time-attendance": "time-attendance",
  "time-attendance": "time-attendance",
  "control-pannel": "access-control",
  "visible-light": "access-control",
  "access-control-time-attendance": "access-control",
  alpha: "door-hardware",
  "zk-teco-accessories": "door-hardware",
  accessories: "door-hardware",
  // Brand umbrella, not a family: its members all sit in another category too.
  "zk-teco": null,
};

export const OLD_CATEGORIES = Object.keys(CATEGORY_TO_FAMILY);

/** Where each old /category/* URL should 301 to. */
export function categoryRedirectTarget(oldSlug: string): string {
  if (oldSlug === "zk-teco") return "/products?brand=zkteco";
  if (oldSlug === "alpha") return "/products/door-hardware?brand=alpha";
  if (oldSlug === "zk-teco-accessories") return "/products/door-hardware?brand=zkteco";
  if (oldSlug === "visible-light") return "/products/access-control?verify=face";
  if (oldSlug === "portable-time-attendance") return "/products/time-attendance?type=portable";
  if (oldSlug === "parking-management") return "/products/entrance-control?type=parking";
  if (oldSlug === "hotel-door-lock-system") return "/products/door-locks?type=hotel";
  const family = CATEGORY_TO_FAMILY[oldSlug];
  return family ? `/products/${family}` : "/products";
}

/**
 * Product types, taken only from AIMS's own category membership (no
 * guessing from names). Used as a filter within a family.
 */
export const PRODUCT_TYPES = [
  "portable",
  "panel",
  "pedestrian",
  "parking",
  "smart",
  "hotel",
  "windows",
  "android",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const CATEGORY_TO_TYPE: Partial<Record<string, ProductType>> = {
  "portable-time-attendance": "portable",
  "control-pannel": "panel",
  "entrance-control": "pedestrian",
  "parking-management": "parking",
  "smart-lock": "smart",
  "hotel-door-lock-system": "hotel",
  "pos-windows": "windows",
  android: "android",
};

export const typesFor = (sourceCategories: string[]): ProductType[] => [
  ...new Set(sourceCategories.map((c) => CATEGORY_TO_TYPE[c]).filter((t): t is ProductType => !!t)),
];

export const SOFTWARE_TYPES = ["time-attendance", "access-control", "security-platform"] as const;
export type SoftwareType = (typeof SOFTWARE_TYPES)[number];

/** Old /swcategory/* slug → software filter. */
export const SWCATEGORY_TO_TYPE: Record<string, SoftwareType | null> = {
  "time-attendance": "time-attendance",
  "access-control": "access-control",
  "zk-teco": null,
};
