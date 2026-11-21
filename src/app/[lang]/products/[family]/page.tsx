import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/catalogue/ListingPage";
import { FAMILIES, type FamilySlug } from "@/content/taxonomy";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";

const isFamily = (s: string): s is FamilySlug => FAMILIES.some((f) => f.slug === s);

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ family: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[family]">): Promise<Metadata> {
  const { family } = await params;
  if (!isFamily(family)) return {};
  const t = await getDictionary();
  return {
    title: t.families[family].name,
    description: FAMILIES.find((f) => f.slug === family)?.summary,
    alternates: alternates(await getLocale(), `/products/${family}`),
  };
}

export default async function FamilyPage({ params }: PageProps<"/[lang]/products/[family]">) {
  const { family } = await params;
  if (!isFamily(family)) notFound();
  return <ListingPage family={family} />;
}
