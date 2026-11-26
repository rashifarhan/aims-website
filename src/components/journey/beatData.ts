import { productBySlug, softwareBySlug } from "@/content/catalogue";
import { FAMILIES } from "@/content/taxonomy";
import type { Timeline } from "@/lib/journey/scrollMap";
import { PRODUCT_COPY, type Spec, WORKS_WITH } from "./story";

export type BeatLink = { label: string; href: string; external?: boolean };
export type AnchorPoint = [frame: number, x: number, y: number, visible: number];
export type BeatData = {
  key: string;
  chapter: string;
  from: number;
  to: number;
  model: string;
  name: string;
  role: string;
  specs: Spec[];
  links: BeatLink[];
  quote: { kind: "product"; slug: string } | { kind: "software"; slug: string; text: string };
  image: { src: string; width: number; height: number; alt: string } | null;
  track: AnchorPoint[];
};

type Paths = { product: (s: string) => string; software: (s: string) => string; family: (s: string) => string; services: string };

/**
 * One beat's card: AIMS's catalogue entry (name, model, photo, datasheet, family) joined to the journey's copy and
 * the product's tracked position in the film. Null when the catalogue no longer has the product, so a renamed
 * product drops its card rather than showing an empty one.
 */
export function beatData(beat: Timeline["beats"][number], anchors: Record<string, AnchorPoint[]>, paths: Paths): BeatData | null {
  const copy = PRODUCT_COPY[beat.key];
  if (!beat.slug || !copy) return null;
  const base = { key: beat.key, chapter: beat.chapter, from: beat.from, to: beat.to, role: copy.role, specs: copy.specs, track: anchors[beat.key] ?? [] };
  const support = { label: "Installation and support", href: paths.services };
  if (beat.kind === "software") {
    const s = softwareBySlug(beat.slug);
    if (!s) return null;
    return {
      ...base,
      model: s.name,
      name: `ZKTeco ${s.name}`,
      links: [{ label: "Software details", href: paths.software(s.slug) }, support],
      quote: { kind: "software", slug: s.slug, text: `${s.name} setup` },
      image: s.image ? { src: s.image.src, width: s.image.width, height: s.image.height, alt: s.image.alt } : null,
    };
  }
  const p = productBySlug(beat.slug);
  if (!p) return null;
  const family = FAMILIES.find((f) => f.slug === p.family);
  const links: BeatLink[] = [{ label: "Product details", href: paths.product(p.slug) }];
  if (p.datasheetUrl) links.push({ label: "Datasheet", href: p.datasheetUrl, external: true });
  for (const w of WORKS_WITH[beat.key] ?? []) if (softwareBySlug(w.slug)) links.push({ label: w.label, href: paths.software(w.slug) });
  if (family) links.push({ label: `All ${family.name.toLowerCase()}`, href: paths.family(family.slug) });
  links.push(support);
  const img = p.images[0];
  return {
    ...base,
    model: p.model,
    name: p.name,
    links,
    quote: { kind: "product", slug: p.slug },
    image: img ? { src: img.src, width: img.width, height: img.height, alt: img.alt } : null,
  };
}
