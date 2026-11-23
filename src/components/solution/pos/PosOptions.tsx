import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { countLabel } from "@/i18n/format";
import { OPTION_ICONS } from "@/components/solution/optionIcons";
import { SolutionOptions } from "@/components/solution/SolutionOptions";
import { posTypeCount } from "./posPage";

/** Line icons on the 32px explainer grid (Design Doc 7): a monitor, a tablet terminal, a handheld. */
const ICONS = {
  windows: "M4 6h24v16H4Zm8 22h8m-4-6v6",
  android: "M6 5h20v16H6Zm4 16v5h12v-5M10 26h12",
  handheld: OPTION_ICONS.mobile,
  fingerprint: OPTION_ICONS.fingerprint,
} as const;

/**
 * "Choose by your software and counter" (T3 row 3, Plan 14). Windows and Android open the listing's type
 * filter with its own count; the handheld and fingerprint cards are single models, so they open the
 * product. No verify filter: the POS method data is too thin to filter on (prep: options).
 */
export async function PosOptions() {
  const { solutionPos: t } = await getDictionary();
  const c = t.methods;
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const items = [
    {
      key: "windows",
      href: href("/products/pos?type=windows"),
      count: countLabel(posTypeCount("windows"), c.countOne, c.count),
    },
    {
      key: "android",
      href: href("/products/pos?type=android"),
      count: countLabel(posTypeCount("android"), c.countOne, c.count),
    },
    { key: "handheld", href: href("/product/zk-h300"), count: c.handheldLink },
    { key: "fingerprint", href: href("/product/zkbio900-series"), count: c.fingerprintLink },
  ] as const;
  return (
    <SolutionOptions
      idPrefix="ps"
      copy={c}
      items={items.map((item) => ({ ...item, icon: ICONS[item.key], ...c.items[item.key] }))}
    />
  );
}
