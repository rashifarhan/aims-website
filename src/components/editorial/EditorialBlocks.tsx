import type { EditorialBlock } from "@/content/pages";

/**
 * AIMS's own copy, rendered from structured blocks (CLAUDE.md §8: no injected HTML). The text is
 * English as published; inside an Arabic page it keeps lang="en" and dir="ltr" (CLAUDE.md §7).
 */
export function EditorialBlocks({ blocks }: { blocks: EditorialBlock[] }) {
  return (
    <div lang="en" dir="ltr" className="editorial-body">
      {blocks.map((b, i) =>
        b.type === "h" ? (
          <h2 key={i}>{b.text}</h2>
        ) : b.type === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
