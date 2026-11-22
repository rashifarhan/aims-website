import "server-only";
import { z } from "zod";
import pagesJson from "../../content/pages.json";

/** Editorial pages written by scripts/import-pages.ts; validated here, at the boundary (CLAUDE.md §8). */
const Block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()) }),
]);
const Page = z.object({ title: z.string(), blocks: z.array(Block) });
const Article = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  date: z.string().nullable(),
  excerpt: z.string(),
  image: z.object({ src: z.string(), width: z.number(), height: z.number(), alt: z.string() }).nullable(),
  blocks: z.array(Block),
});
const Pages = z.object({
  legal: z.object({ "privacy-policy": Page, "terms-and-conditions": Page }),
  articles: z.array(Article),
});

const pages = Pages.parse(pagesJson);

export type EditorialBlock = z.infer<typeof Block>;
export type Article = z.infer<typeof Article>;
export type LegalSlug = keyof typeof pages.legal;

export const legalPage = (slug: LegalSlug) => pages.legal[slug];
/** Newest first, as the live blog lists them. */
export const articles = (): Article[] => pages.articles;
export const articleBySlug = (slug: string) => pages.articles.find((a) => a.slug === slug);
