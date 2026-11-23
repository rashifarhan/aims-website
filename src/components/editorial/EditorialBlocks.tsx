import type { EditorialBlock } from "@/content/pages";
import { headingId, isSubheading } from "@/lib/editorial";

type Props = { blocks: EditorialBlock[]; level?: 2 | 3; anchored?: boolean };

/**
 * AIMS's own copy, rendered from structured blocks (CLAUDE.md §8: no injected HTML). The text is
 * English as published; inside an Arabic page it keeps lang="en" and dir="ltr" (CLAUDE.md §7).
 * Headings start at `level`; a numbered subsection ("3.1 …") goes one level down, so headings stay in
 * order (CLAUDE.md §4). `anchored` gives each heading the id the in-page index links to.
 */
export function EditorialBlocks({ blocks, level = 2, anchored = false }: Props) {
  return (
    <div lang="en" dir="ltr" className="editorial-body">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          const Heading = level === 2 ? (isSubheading(b.text) ? "h3" : "h2") : isSubheading(b.text) ? "h4" : "h3";
          return (
            <Heading key={i} id={anchored ? headingId(i, b.text) : undefined}>
              {b.text}
            </Heading>
          );
        }
        if (b.type === "p") return <p key={i}>{b.text}</p>;
        return (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
