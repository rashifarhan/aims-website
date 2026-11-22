import type { Block } from "@/content/schema";

/**
 * AIMS's overview copy as structured blocks (never raw HTML). Headings start at h3 under the section h2.
 * Some imported blocks run table cells together into one very long word; they break anywhere rather than
 * widen the page (CLAUDE.md 4: reflow at 320px).
 */
export function Overview({ blocks, data }: { blocks: Block[]; data: { lang?: string; dir?: "ltr" } }) {
  return (
    <div className="max-w-[68ch] min-w-0 space-y-4 text-base leading-relaxed wrap-anywhere text-ink-700" {...data}>
      {blocks.map((b, i) =>
        b.type === "h" ? (
          <h3 key={i} className="pt-2 text-lg font-semibold text-ink">
            {b.text}
          </h3>
        ) : b.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1.5 ps-5 marker:text-ink-300">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  );
}
