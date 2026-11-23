/*
 * Kept apart from navigationHref.ts so client components (the language switch) can use it without
 * shipping the route registry.
 */

/**
 * Links whose automatic prefetch must stay off. In this Next version the router predicts an unprefixed
 * one-segment URL such as /support as the `[lang]` page itself (lang = "support"), because the proxy's
 * rewrite to /en/support is invisible to it. It asks for that segment, gets a 404 and retries in an
 * endless loop: ~2,400 RSC requests in 5 s from the solutions hub link (22 Nov 2026); 1,519 from the
 * footer's privacy and terms links; 1,437 from the homepage's support and contact links and ~800 from
 * each Arabic page's English language link once About, Services and Support were built (23 Nov 2026).
 * Which links loop varies from load to load, so every English one-segment path is kept off prefetch,
 * as are filtered listings (`?q=…`) and the solutions hub in both languages. They load normally on click.
 */
export function prefetchSafe(href: string): boolean {
  const [path, query] = href.split("?");
  const local = path.replace(/^\/ar(?=\/|$)/, "") || "/";
  const englishOneSegment = /^\/[^/]+$/.test(path) && !/^\/ar$/.test(path);
  return !query && local !== "/solutions" && !englishOneSegment;
}
