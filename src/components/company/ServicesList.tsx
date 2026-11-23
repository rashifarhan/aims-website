import { SolutionOptions } from "@/components/solution/SolutionOptions";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";

/** Line icons on the 32px explainer grid (Design Doc 7), one per service. */
const SERVICES = [
  { key: "supply", href: "/products", icon: "M5 10l11-5 11 5v12l-11 5-11-5Zm0 0 11 5 11-5M16 15v12" },
  { key: "design", href: "/solutions", icon: "M6 6h20v20H6ZM6 13h20M13 13v13m6-7h4" },
  {
    key: "installation",
    href: "/quote?need=install",
    icon: "M20 5a6 6 0 0 0-5.6 8.1L5 22.5V27h4.5l9.4-9.4A6 6 0 0 0 27 12l-4 4-3-1-1-3 4-4a6 6 0 0 0-3-3Z",
  },
  {
    key: "support",
    href: "/support",
    icon: "M6 18v-3a10 10 0 0 1 20 0v3M6 18h4v7H8a2 2 0 0 1-2-2Zm20 0h-4v7h2a2 2 0 0 0 2-2Zm-4 7c0 2-2 3-5 3h-2",
  },
] as const;

/**
 * Master Plan 12 #5 "supply, design, install, support": the four services AIMS publishes, each a card
 * that opens where that service starts, on the T3 option card (ui/sections.css .method-card).
 */
export async function ServicesList() {
  const { services } = await getDictionary();
  const locale = await getLocale();
  const items = SERVICES.map(({ key, href, icon }) => ({
    key,
    icon,
    title: services.items[key].title,
    body: services.items[key].body,
    href: localePath(locale, href),
    count: services.items[key].action,
  }));
  return <SolutionOptions idPrefix="services" copy={services.list} items={items} />;
}
