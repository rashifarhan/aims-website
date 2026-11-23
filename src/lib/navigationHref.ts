import { localePath } from "@/i18n/config";
import { builtRoutes } from "./routes";
import { LIVE_AIMS } from "./site";

const BUILT = new Set(builtRoutes().map((route) => route.path));

/** Keep planned destinations out of preview navigation (CLAUDE.md §6). */
export function navigationHref(href: string): string {
  const locale = href === "/ar" || href.startsWith("/ar/") ? "ar" : "en";
  const path = locale === "ar" ? href.slice(3) || "/" : href;
  // A built page always wins over its preview fallback (CLAUDE.md §6: link to built routes).
  if (BUILT.has(path.split(/[?#]/)[0])) return href;
  if (path === "/locations") return `${localePath(locale, "/")}#showrooms`;
  // Services and support route to the built contact page, which sends each need to the right AIMS line.
  if (["/services", "/support"].includes(path)) return localePath(locale, "/contact");
  if (path === "/software") return LIVE_AIMS.software;
  if (path.startsWith("/software/") || path === "/about") {
    return `${LIVE_AIMS.home.slice(0, -1)}${path}`;
  }
  return href;
}
