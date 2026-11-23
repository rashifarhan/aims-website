import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { BUILT_SOFTWARE, isBuiltSoftware } from "@/lib/software";
import { softwareBySlug } from "@/content/catalogue";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { SoftwareFeatures } from "@/components/software/SoftwareFeatures";
import { SoftwareTerminals } from "@/components/software/SoftwareTerminals";
import { SoftwareSetup } from "@/components/software/SoftwareSetup";
import { AddSoftwareToQuote } from "@/components/software/AddSoftwareToQuote";
import { loadSoftwarePage } from "@/components/software/softwareCopy";
import { ClosePanel } from "@/components/ui/ClosePanel";
import { PageHero } from "@/components/ui/PageHero";
import { fmt } from "@/i18n/format";
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
  const { software, t, c, page, addLabels, href } = await loadSoftwarePage(slug);
  const addToQuote = (
    <AddSoftwareToQuote slug={slug} name={software.name} quoteHref={href("/quote")} labels={addLabels} />
  );
  return (
    <main id="main">
      {/* The h1 names the platform and its category, so no label sits above it (impeccable craft floor);
          the lead says what it does and where AIMS sets it up (the hard fact). */}
      <PageHero
        variant="split"
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/software"), label: c.software },
          { href: href(`/software/${slug}`), label: software.name },
        ]}
        title={page.title}
        lead={page.lead}
        primary={addToQuote}
        secondary={{ href: "#terminals", label: page.jump }}
        photo={software.image}
        framed
      />
      <SoftwareFeatures slug={slug} />
      <SoftwareTerminals slug={slug} />
      <SoftwareSetup slug={slug} />
      {/* The hero's main action again, worded the same, and one link (Design Doc 2). */}
      <ClosePanel
        id="sw-close-title"
        heading={fmt(c.close.heading, { name: software.name })}
        body={c.close.body}
        action={addToQuote}
        secondary={{ href: href("/software"), label: c.close.all }}
      />
      <MomentTrigger />
    </main>
  );
}
