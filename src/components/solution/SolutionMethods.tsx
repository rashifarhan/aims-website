import { getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { countLabel } from "@/i18n/format";
import { methodCount, type SolutionPageData } from "@/content/solutionPages";
import type { Method } from "@/content/schema";
import { OPTION_ICONS, type OptionIconKey } from "./optionIcons";
import { SolutionOptions } from "./SolutionOptions";
import type { MethodsCopy } from "./types";

type Props<K extends OptionIconKey> = {
  idPrefix: string;
  page: Pick<SolutionPageData, "family"> & { methods: readonly { key: K; match: readonly Method[] }[] };
  copy: MethodsCopy<K>;
};

/**
 * The verify-method guide: one card per method with the family's count, opening the listing filtered
 * by that method (Plan 14; the count follows the listing's own rule, so both always agree).
 */
export async function SolutionMethods<K extends OptionIconKey>({ idPrefix, page, copy }: Props<K>) {
  const locale = await getLocale();
  const items = page.methods.map(({ key, match }) => ({
    key,
    icon: OPTION_ICONS[key],
    title: copy.items[key].title,
    body: copy.items[key].body,
    href: localePath(locale, `/products/${page.family}?verify=${match.join(",")}`),
    count: countLabel(methodCount(page.family, match), copy.countOne, copy.count),
  }));
  return <SolutionOptions idPrefix={idPrefix} copy={copy} items={items} />;
}
