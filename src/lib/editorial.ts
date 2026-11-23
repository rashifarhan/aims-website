import type { Block } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import type { SolutionSlug } from "./nav";

/** A stable anchor for the heading at `index`; the index keeps two identical headings apart. */
export function headingId(index: number, text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `s${index}-${slug}` : `s${index}`;
}

/** "3.1 Product Information" sits under "3. Products…": it renders one level down (headings in order). */
export const isSubheading = (text: string) => /^\d+\.\d+\s/.test(text);

/** The in-page index of a T10 page (Design Doc 10.1): each top-level heading with the id it renders with. */
export function outline(blocks: Block[]): { id: string; text: string }[] {
  return blocks.flatMap((b, i) =>
    b.type === "h" && !isSubheading(b.text) ? [{ id: headingId(i, b.text), text: b.text }] : [],
  );
}

/**
 * The questions /support shows from AIMS's FAQ. An item with no answer (the live page repeats item 11's
 * question as its answer) is left out rather than shown empty, and so is an answer that makes a partner
 * claim the claims policy replaces ("Strategic Partner"; Design Doc 3.1): the page states the approved
 * authorization line itself.
 */
export function publishableQuestions<T extends { question: string; answer: Block[] }>(items: T[]): T[] {
  return items.filter(
    (item) =>
      item.answer.length > 0 &&
      !item.answer.some((b) => b.type !== "ul" && /strategic (business )?partner/i.test(b.text)),
  );
}

/** "2026-11-18" in the page's language; numbers stay Latin, as the rest of the site writes them. */
export function articleDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * The solution page an article leads into (Master Plan 12 #13–14: "Read → solution"), read from the
 * words of its own slug; short product slugs are matched to the product's catalogue family (M6 is an
 * attendance terminal, Mars a swing barrier, TL300 a smart lock). First match wins, so a turnstile guide
 * that ends on "access control" stays on entrance control. No match: the solutions hub.
 */
const TOPICS: [RegExp, SolutionSlug][] = [
  [/\bpos\b|point-of-sales/, "pos"],
  [/turnstile|speed-gates|gate-barriers|\bmars\b/, "entrance-parking"],
  [/time-attendance|\bm6\b/, "time-attendance"],
  [/access-control|rfid|fingerprint|facial|unauthorised-access/, "access-control"],
  [/smart-locks?\b|\btl-\d+\b/, "door-locks"],
];

export function articleSolution(slug: string): SolutionSlug | null {
  return TOPICS.find(([pattern]) => pattern.test(slug))?.[1] ?? null;
}
