import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { countLabel } from "@/i18n/format";
import { productsInFamily } from "@/content/catalogue";
import { SolutionOptions } from "@/components/solution/SolutionOptions";
import { lockTypeCount } from "./doorLocksPage";

/** Line icons on the 32px explainer grid (Design Doc 7): a front door, a glass pane, a bed, an EM lock. */
const ICONS = {
  smart: "M7 28V5h18v23M4 28h24M19 14h2v6h-2Z",
  glass: "M7 4h18v24H7ZM11 12l6-6M11 18l10-10M4 28h24",
  hotel: "M4 25V8M4 19h24v6M4 15h8a2 2 0 0 1 2 2v2m0-4h10a4 4 0 0 1 4 4",
  wired: "M4 8h24v8H4Zm6 8v4h12v-4m-6 4v8M8 12h3",
} as const;

/**
 * "Choose by the door" (T3 row 3, Plan 14): one card per kind of door. The smart and hardware counts
 * follow the listing's own filters; the hotel card names its filter instead of a count, because that
 * filter also holds the CR60W card reader (prep: claims removed).
 */
export async function LockOptions() {
  const { solutionDoorLocks: t } = await getDictionary();
  const c = t.methods;
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const items = [
    {
      key: "smart",
      href: href("/products/door-locks?type=smart"),
      count: countLabel(lockTypeCount("smart"), c.smartCountOne, c.smartCount),
    },
    { key: "glass", href: href("/product/gl300"), count: c.glassLink },
    { key: "hotel", href: href("/products/door-locks?type=hotel"), count: c.hotelLink },
    {
      key: "wired",
      href: href("/products/door-hardware"),
      count: countLabel(productsInFamily("door-hardware").length, c.wiredCountOne, c.wiredCount),
    },
  ] as const;
  return (
    <SolutionOptions
      idPrefix="dl"
      copy={c}
      items={items.map((item) => ({ ...item, icon: ICONS[item.key], ...c.items[item.key] }))}
    />
  );
}
