import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { LegalPage } from "@/components/editorial/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.editorial["terms-and-conditions"],
    description: t.editorial.termsDescription,
    alternates: alternates(await getLocale(), "/terms-and-conditions"),
  };
}

/** T10 editorial: AIMS's terms and conditions, as published (Master Plan 12 #11–12; URL kept, CLAUDE.md §6). */
export default function TermsAndConditions() {
  return <LegalPage slug="terms-and-conditions" />;
}
