import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import type en from "./messages/en.json";
import { hasLocale, type Locale } from "./config";

/** English is the source of truth; ar.json must have the same keys (tested). */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((m) => m.default),
  ar: () => import("./messages/ar.json").then((m) => m.default),
};

/** The current request's locale, read from the root [lang] segment. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
