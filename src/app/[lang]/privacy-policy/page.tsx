import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { LegalPage } from "@/components/editorial/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.editorial["privacy-policy"],
    description: t.editorial.privacyDescription,
    alternates: alternates(await getLocale(), "/privacy-policy"),
  };
}

/** T10 editorial: AIMS's privacy policy, as published (Master Plan 12). */
export default function PrivacyPolicy() {
  return <LegalPage slug="privacy-policy" />;
}
