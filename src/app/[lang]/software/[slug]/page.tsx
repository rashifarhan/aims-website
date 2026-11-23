import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { BUILT_SOFTWARE, isBuiltSoftware } from "@/lib/software";
import { softwareBySlug } from "@/content/catalogue";
import { MomentTrigger } from "@/components/home/MomentTrigger";
import { SoftwareHero } from "@/components/software/SoftwareHero";
import { SoftwareFeatures } from "@/components/software/SoftwareFeatures";
import { SoftwareTerminals } from "@/components/software/SoftwareTerminals";
import { SoftwareSetup } from "@/components/software/SoftwareSetup";
import { SoftwareClose } from "@/components/software/SoftwareClose";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";
import "@/components/software/software.css";

/** The built software pages (Plan 12 #29–31). URLs are unchanged from aimsuae.me (AT-13). */
export function generateStaticParams() {
  return BUILT_SOFTWARE.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/software/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const software = softwareBySlug(slug);
  if (!isBuiltSoftware(slug) || !software) return {};
  const page = (await getDictionary()).softwarePage.pages[slug];
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: alternates(await getLocale(), `/software/${slug}`),
    openGraph: software.image
      ? { images: [{ url: software.image.src, width: software.image.width, height: software.image.height }] }
      : undefined,
  };
}

/** T6 software detail: hero, features, terminals (the moment), setup, close (Master Plan 14; Design Doc 10.1). */
export default async function SoftwarePage({ params }: PageProps<"/[lang]/software/[slug]">) {
  const { slug } = await params;
  if (!isBuiltSoftware(slug)) notFound();
  return (
    <main id="main">
      <SoftwareHero slug={slug} />
      <SoftwareFeatures slug={slug} />
      <SoftwareTerminals slug={slug} />
      <SoftwareSetup slug={slug} />
      <SoftwareClose slug={slug} />
      <MomentTrigger />
    </main>
  );
}
