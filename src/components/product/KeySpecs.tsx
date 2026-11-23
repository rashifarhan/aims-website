import type { SpecRow } from "@/content/schema";
import type { DataAttrs } from "./englishData";

/** One tile repeats the spec table and reads as a stray box; two or more earn the row (audit T3). */
const MIN_TILES = 2;

/**
 * Up to four verbatim spec rows beside the photo (Design Doc 10, T5), set as facts on hairlines rather than
 * grey tiles, so the hero reads as one composition and not a stack of boxes (taste sections.md, Product).
 */
export function KeySpecs({ tiles, heading, data }: { tiles: SpecRow[]; heading: string; data: DataAttrs }) {
  if (tiles.length < MIN_TILES) return null;
  return (
    <section aria-labelledby="key-specs" className="mt-6">
      <h2 id="key-specs" className="sr-only">
        {heading}
      </h2>
      <dl className="grid grid-cols-2 gap-x-6">
        {tiles.map((f) => (
          // English data keeps "3000 Templates" in order on Arabic pages and still lines up with the
          // page's start edge (G4; rtl:text-end resolves to the right inside the LTR tile).
          <div
            key={f.label}
            {...data}
            className="flex min-w-0 flex-col-reverse border-t border-line py-3 wrap-anywhere rtl:text-end"
          >
            <dt className="mt-1 text-caption text-ink-600">{f.label}</dt>
            <dd className="text-lg leading-snug font-semibold text-ink tabular-nums">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
