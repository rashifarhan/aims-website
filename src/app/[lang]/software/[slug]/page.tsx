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
import { SmoothScroll } from "@/components/inside/SmoothScroll";
import { PageStage } from "@/components/products-inside/PageStage";
import { SOLUTION_STAGES, type ProductStage } from "@/components/products-inside/stages";
import { SoftwareInside } from "@/components/software-inside/SoftwareInside";
import { SOFTWARE_STAGE } from "@/components/software-inside/words";
import { fmt } from "@/i18n/format";
import "@/components/software/software.css";
import "@/components/inside/inside.css";
import "@/components/inside/skin.css";
import "@/components/products-inside/products-inside.css";
import "@/components/product-inside/product-inside.css";

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
  // The platform's own picture on its plate; without one, a terminal it runs on, labelled "Shown".
  const stage: ProductStage = software.image
    ? {
        model: software.name,
        productSlug: slug,
        image: { src: software.image.src, w: software.image.width, h: software.image.height },
        screen: { x: 0, y: 0, w: 1, h: 1 },
      }
    : SOLUTION_STAGES["time-attendance"];
  const addToQuote = (
    <AddSoftwareToQuote slug={slug} name={software.name} quoteHref={href("/quote")} labels={addLabels} />
  );
  return (
    <main id="main" className="d2">
      {/* The h1 names the platform and its category (impeccable craft floor); the lead says what it does and where
          AIMS sets it up. Its picture stands on the cream plate the dive flies into. */}
      <PageStage
        id="software-detail-stage"
        stage={stage}
        plate={software.image ? { alt: software.image.alt } : undefined}
        productHref={software.image ? undefined : href(`/product/${stage.productSlug}`)}
        word={SOFTWARE_STAGE[slug].word}
        ground={SOFTWARE_STAGE[slug].ground}
        crumbs={[
          { href: href("/"), label: t.common.home },
          { href: href("/software"), label: c.software },
          { href: href(`/software/${slug}`), label: software.name },
        ]}
        title={page.title}
        lead={page.lead}
        primary={{ href: "#terminals", label: page.jump }}
        secondary={{ href: href("/quote"), label: t.productsStage.quote }}
      >
        <SoftwareInside software={software} t={t} jump={page.jump} addToQuote={addToQuote} />
      </PageStage>
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
      <SmoothScroll />
    </main>
  );
}
