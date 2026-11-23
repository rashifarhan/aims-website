import "server-only";
import { z } from "zod";
import pagesJson from "../../content/pages.json";
import { BlockSchema } from "./schema";

/** Editorial pages written by scripts/import-pages.ts; validated here, at the boundary (CLAUDE.md §8). */
const Page = z.object({ title: z.string(), blocks: z.array(BlockSchema) });
const Question = z.object({ question: z.string(), answer: z.array(BlockSchema) });
const Article = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  date: z.iso.date().nullable(),
  excerpt: z.string(),
  image: z.object({ src: z.string(), width: z.number(), height: z.number(), alt: z.string() }).nullable(),
  blocks: z.array(BlockSchema),
});
const Pages = z.object({
  legal: z.object({ "privacy-policy": Page, "terms-and-conditions": Page }),
  support: z.object({ warranty: Page, faq: z.object({ title: z.string(), items: z.array(Question) }) }),
  articles: z.array(Article),
});

const pages = Pages.parse(pagesJson);

export type EditorialBlock = z.infer<typeof BlockSchema>;
export type Article = z.infer<typeof Article>;
export type LegalSlug = keyof typeof pages.legal;

export const legalPage = (slug: LegalSlug) => pages.legal[slug];
/** ZKTeco's warranty policy as AIMS publishes it (/zkteco-warranty-policy → /support#warranty). */
export const warrantyPage = () => pages.support.warranty;
/** AIMS's FAQ as published (/faq → /support#faq); the page filters it with `publishableQuestions`. */
export const faqItems = () => pages.support.faq.items;
/** Newest first, as the live blog lists them. */
export const articles = (): Article[] => pages.articles;
export const articleBySlug = (slug: string) => pages.articles.find((a) => a.slug === slug);
