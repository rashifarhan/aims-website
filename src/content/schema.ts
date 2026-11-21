import { z } from "zod";
import { FAMILIES, SOFTWARE_TYPES } from "./taxonomy";

const familySlugs = FAMILIES.map((f) => f.slug) as [string, ...string[]];

export const METHODS = ["face", "palm", "fingerprint", "card", "qr", "pin", "mobile"] as const;
export const CONNECTIVITY = ["tcp-ip", "wifi", "4g", "poe", "rs485", "usb", "wiegand", "bluetooth"] as const;

export const SpecRowSchema = z.object({
  /** Canonical label shown on the site, e.g. "Dimensions (W × D × H)". */
  label: z.string().min(1),
  value: z.string().min(1),
  /** Label exactly as it appears on aimsuae.me, kept for traceability. */
  sourceLabel: z.string().optional(),
});

export const SpecGroupSchema = z.object({
  title: z.string(),
  rows: z.array(SpecRowSchema),
});

/** Overview copy, reduced to safe structured blocks (no raw HTML). */
export const BlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()) }),
]);

export const ImageSchema = z.object({
  /** Path under /public, e.g. /images/products/f18.webp */
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
  /** Original URL on aimsuae.me. */
  source: z.url(),
});

export const ProductSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  brand: z.enum(["zkteco", "alpha", "other"]),
  /** Model code used in mono type, e.g. "F18", "AL-M280". */
  model: z.string(),
  family: z.enum(familySlugs),
  /** Original aimsuae.me categories, kept for redirects and audits. */
  sourceCategories: z.array(z.string()),
  label: z.string().optional(),
  summary: z.string(),
  overview: z.array(BlockSchema),
  specs: z.array(SpecGroupSchema),
  methods: z.array(z.enum(METHODS)),
  connectivity: z.array(z.enum(CONNECTIVITY)),
  outdoor: z.boolean(),
  images: z.array(ImageSchema),
  /** Datasheet link on aimsuae.me (/product/brochure/{id}); null if none. */
  datasheetUrl: z.url().nullable(),
  sourceUrl: z.url(),
  /** Set when this record duplicates another product (e.g. f18-1 → f18). */
  duplicateOf: z.string().optional(),
});

export const SoftwareSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  types: z.array(z.enum(SOFTWARE_TYPES)),
  summary: z.string(),
  overview: z.array(BlockSchema),
  image: ImageSchema.nullable(),
  /**
   * How AIMS currently delivers the file. On aimsuae.me every "Download"
   * button opens WhatsApp, so the default is "request".
   */
  delivery: z.enum(["request", "direct"]),
  downloadUrl: z.string().nullable(),
  sourceUrl: z.url(),
});

export type SpecRow = z.infer<typeof SpecRowSchema>;
export type SpecGroup = z.infer<typeof SpecGroupSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Software = z.infer<typeof SoftwareSchema>;
export type Method = (typeof METHODS)[number];
export type Connectivity = (typeof CONNECTIVITY)[number];
