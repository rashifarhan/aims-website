import "server-only";
import pagesJson from "../../content/pages.json";
import type { Block } from "./schema";

export type PageKey = "about" | "privacy" | "terms" | "warranty" | "faq" | "installation" | "article";
export type PageContent = { title: string; sourceUrl: string; blocks: Block[] };
export type BlogPost = { slug: string; title: string };

const data = pagesJson as { pages: Record<PageKey, PageContent>; posts: BlogPost[] };

/** AIMS's own published text for a page (content/pages.json, from `pnpm import:pages`). */
export const pageContent = (key: PageKey): PageContent => data.pages[key];

/** The article built in this preview (Master Plan 12 #14); AIMS's other posts stay on aimsuae.me. */
export const ARTICLE_SLUG =
  "how-to-choose-an-access-control-system-for-your-business-a-complete-guide-by-aims-security-systems-trading-llc";
export const blogPosts = (): BlogPost[] => data.posts;
