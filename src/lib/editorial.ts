import type { Block } from "@/content/schema";

/** A stable anchor for the heading at `index`; the index keeps two identical headings apart. */
export function headingId(index: number, text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `s${index}-${slug}` : `s${index}`;
}

/** The in-page index for a T10 page (Design Doc 10.1): each heading with the id it renders with. */
export function outline(blocks: Block[]): { id: string; text: string }[] {
  return blocks.flatMap((b, i) => (b.type === "h" ? [{ id: headingId(i, b.text), text: b.text }] : []));
}

/** AIMS's FAQ page as published: a heading per question, then its answer blocks. */
export function groupQuestions(blocks: Block[]): { question: string; answer: Block[] }[] {
  const groups: { question: string; answer: Block[] }[] = [];
  for (const block of blocks) {
    if (block.type === "h") groups.push({ question: block.text, answer: [] });
    else groups.at(-1)?.answer.push(block);
  }
  return groups;
}

/**
 * Removes the sentence that states a founding year. The live site gives both 2011 and 2014, so the
 * year stays off the site until AIMS confirms it (CLAUDE.md §1, open questions).
 */
export function withoutFoundingYear(text: string): string {
  return text
    .split(/(?<=\.)\s+/)
    .filter((sentence) => !/\bestablished in\s+\d{4}\b/i.test(sentence))
    .join(" ");
}
