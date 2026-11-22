import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { pageContent } from "@/content/pages";
import { alternates } from "@/lib/seo";
import { EditorialPage } from "./EditorialPage";
import "./editorial.css";

type LegalKey = "privacy" | "terms";

export async function legalMetadata(key: LegalKey, path: string): Promise<Metadata> {
  const c = (await getDictionary()).legal[key];
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), path) };
}

/**
 * T10 legal page (Master Plan 12 #11–12): AIMS's published text as readable prose with an in-page
 * index, and the preview's note that nothing is sent. The text is not ours to edit, so it is shown
 * as published, in English (marked `lang="en"` on Arabic pages).
 */
export async function LegalPage({ keyName, path }: { keyName: LegalKey; path: string }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.legal[keyName];
  return (
    <EditorialPage
      crumbs={[
        { href: localePath(locale, "/"), label: t.common.home },
        { href: localePath(locale, path), label: c.title },
      ]}
      title={c.title}
      lead={c.lead}
      note={t.legal.note}
      blocks={pageContent(keyName).blocks}
      blocksLang={locale === "en" ? undefined : "en"}
    />
  );
}
