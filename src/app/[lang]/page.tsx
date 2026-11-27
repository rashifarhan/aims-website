import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { COMPANY_NAME, CONTACT, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { SmoothScroll } from "@/components/inside/SmoothScroll";
import { ScrollReveals } from "@/components/inside/ScrollReveals";
import { HomeDive } from "@/components/home-inside/HomeDive";
import { InsideFigures } from "@/components/home-inside/InsideFigures";
import { InsidePlaces } from "@/components/home-inside/InsidePlaces";
import { InsideSoftware } from "@/components/home-inside/InsideSoftware";
import { InsideJourney } from "@/components/home-inside/InsideJourney";
import { InsideVisit } from "@/components/home-inside/InsideVisit";
import { InsideClose } from "@/components/home-inside/InsideClose";
import "@/components/inside/inside.css";
import "@/components/home-inside/home-inside.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.home.metaTitle,
    description: t.home.metaDescription,
    alternates: alternates(await getLocale(), "/"),
  };
}

/**
 * The home page, direction 2 "Step inside the terminal" (CLAUDE.md → Design rules): the dive (the SpeedFace flies
 * forward and the six families open inside its screen) · the four company figures and the published reviews (paper) ·
 * the places, each linked to its solution (night) · software on a screen (paper) · how AIMS works, the pinned job
 * ticket (stage) · the branches and the visitor pass (paper) · the close (stage). Night and paper alternate; the
 * header stays white. Factual Organization data: Plan AT-12.
 */
export default function Home() {
  return (
    <main id="main" className="in-home">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY_NAME,
          url: SITE_URL,
          email: CONTACT.email,
          telephone: CONTACT.lines.headOffice.tel,
        }}
      />
      <HomeDive />
      <InsideFigures />
      <InsidePlaces />
      <InsideSoftware />
      <InsideJourney />
      <InsideVisit />
      <InsideClose />
      <SmoothScroll />
      <ScrollReveals />
    </main>
  );
}
