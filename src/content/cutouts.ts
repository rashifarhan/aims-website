import "server-only";
import { z } from "zod";
import cutoutsJson from "../../content/cutouts.json";
import type { Product } from "./schema";

/** Trimmed cut-outs written by scripts/derive-cutouts.ts; validated here, at the boundary. */
const Cutouts = z.record(
  z.string(),
  z.object({ src: z.string(), width: z.number().int().positive(), height: z.number().int().positive() }),
);
const cutouts = Cutouts.parse(cutoutsJson);

export type Picture = { src: string; width: number; height: number };

/**
 * The product's photograph with its white margin trimmed, so it stands big and whole (design skill
 * sections.md, Product rule 1); the imported photograph when no cut-out exists.
 */
export function cutoutFor(product: Product): Picture | undefined {
  return cutouts[product.slug] ?? product.images[0];
}
