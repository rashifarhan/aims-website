import type { Metadata } from "next";
import { ListingPage } from "@/components/catalogue/ListingPage";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.catalogue.allTitle,
    description: t.meta.defaultDescription,
    alternates: alternates(await getLocale(), "/products"),
  };
}

export default function ProductsPage() {
  return <ListingPage />;
}
