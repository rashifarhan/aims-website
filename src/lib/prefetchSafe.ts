/*
 * Kept apart from navigationHref.ts so client components (the language switch) can use it without
 * shipping the route registry.
 */
/**
 * Links whose automatic prefetch must stay off. In this Next version, prefetching the solutions hub or
 * a filtered listing (`?q=…`) from the homepage requests the homepage's own page segment through the
 * locale rewrite, gets a 404 and then re-fetches the layout segment in an endless loop (~2,400 requests
 * in 5 s, reproduced 22 Nov 2026). The privacy and terms pages loop the same way once they are local:
 * the router asks for the `[lang]` page segment of /terms-and-conditions, gets a 404 and retries
 * (1,519 requests from the homepage, 1,267 from the Arabic terms page's language link, 23 Nov 2026).
 * These pages still load normally on click.
 */
const NO_PREFETCH = new Set(["/solutions", "/privacy-policy", "/terms-and-conditions"]);

export function prefetchSafe(href: string): boolean {
  const [path, query] = href.split("?");
  const local = path.replace(/^\/ar(?=\/|$)/, "") || "/";
  return !query && !NO_PREFETCH.has(local);
}
