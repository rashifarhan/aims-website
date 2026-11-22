import type { Block } from "@/content/schema";
import { headingId } from "@/lib/editorial";

/**
 * AIMS's text as structured blocks (never raw HTML, CLAUDE.md §8). Headings become h2 (h3 under a section's own h2) with the same
 * ids the in-page index links to, so the page's headings stay in order under its one h1.
 */
export function EditorialBlocks({ blocks, lang, level = 2 }: { blocks: Block[]; lang?: string; level?: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="ed-prose" lang={lang}>
      {blocks.map((block, i) => {
        if (block.type === "h") {
          return (
            <Heading key={i} id={headingId(i, block.text)}>
              {block.text}
            </Heading>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}
