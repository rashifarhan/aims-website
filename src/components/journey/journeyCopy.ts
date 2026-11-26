import { productBySlug, softwareBySlug } from "@/content/catalogue";
import type { Timeline } from "@/lib/journey/scrollMap";
import type { BeatCopy } from "./JourneyBeat";

/** Chapter labels for the index and the cards' eyebrows (exploration copy, English only for now). */
export const CHAPTER_LABELS: Record<string, string> = {
  hero: "Arrive",
  parking: "Parking barriers",
  lobby: "Security gates and screening",
  office: "Door access control",
  clockin: "Face recognition attendance",
  finale: "Showrooms",
};

const SKIP = /^(model|product model)/i;

/**
 * Build a beat's card from the catalogue: product name, model, summary and up to three spec rows, or for
 * BioTime its summary and first three listed features. Returns null if the slug is not in the catalogue, so a
 * renamed product drops its card rather than showing an empty one.
 */
export function beatCopy(beat: Timeline["beats"][number], paths: { product: (slug: string) => string; software: (slug: string) => string; quote: string }): BeatCopy | null {
  if (!beat.slug) return null;
  const common = {
    eyebrow: CHAPTER_LABELS[beat.chapter] ?? "",
    quoteHref: paths.quote,
    quoteLabel: "Request a quote",
  };
  if (beat.kind === "software") {
    const s = softwareBySlug(beat.slug);
    if (!s) return null;
    const list = s.overview.find((b) => b.type === "ul");
    const features = list && list.type === "ul" ? list.items.slice(0, 3) : [];
    return {
      ...common,
      model: beat.key,
      name: s.name,
      summary: s.summary,
      facts: features.map((item) => ({ label: "", value: item })), // a feature list: no labels
      href: paths.software(s.slug),
      hrefLabel: "View software",
    };
  }
  const p = productBySlug(beat.slug);
  if (!p) return null;
  const rows = p.specs.flatMap((g) => g.rows).filter((r) => !SKIP.test(r.label));
  return {
    ...common,
    model: p.model,
    name: p.name,
    summary: p.summary,
    facts: rows.slice(0, 3).map((r) => ({ label: r.label, value: r.value })),
    href: paths.product(p.slug),
    hrefLabel: "View product",
  };
}
