import "server-only";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { softwareBySlug } from "@/content/catalogue";
import type { BuiltSoftware } from "@/lib/software";
import type { AddSoftwareLabels } from "./AddSoftwareToQuote";

/** Everything a T6 detail section reads: the record, its page copy and locale-aware paths. */
export async function loadSoftwarePage(slug: BuiltSoftware) {
  const software = softwareBySlug(slug);
  if (!software) notFound();
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.softwarePage;
  const addLabels: AddSoftwareLabels = {
    add: c.add,
    inQuote: c.inQuote,
    added: c.added,
    viewQuote: c.viewQuote,
    line: c.line,
  };
  return {
    software,
    t,
    c,
    page: c.pages[slug],
    addLabels,
    href: (path: string) => localePath(locale, path),
  };
}
