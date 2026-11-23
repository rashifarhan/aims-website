import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BuiltSoftware } from "@/lib/software";
import { AddSoftwareToQuote } from "./AddSoftwareToQuote";
import { loadSoftwarePage } from "./softwareCopy";
import "@/components/motion/entrance.css";

/**
 * T6 detail, first screen (Plan 14; taste layout-v4 §3): the h1 names the platform and its category,
 * the lead says what it does and where AIMS sets it up (the hard fact), two actions, and AIMS's own
 * product image whole beside the words. No label above the h1: it names the category itself
 * (impeccable craft floor). Enters once on load, then stands (taste motion.md; software.css).
 */
export async function SoftwareHero({ slug }: { slug: BuiltSoftware }) {
  const { software, t, c, page, addLabels, href } = await loadSoftwarePage(slug);
  return (
    <section className="sw-hero aims-hero page-container" aria-labelledby="sw-title" data-enter>
      <div className="sw-hero-text">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href("/software"), label: c.software },
            { href: href(`/software/${slug}`), label: software.name },
          ]}
        />
        <h1 id="sw-title" className="aims-headline-mask">
          <span className="aims-headline">{page.title}</span>
        </h1>
        <p className="t3-promise sw-enter">{page.lead}</p>
        <div className="t3-actions sw-enter">
          <AddSoftwareToQuote slug={slug} name={software.name} quoteHref={href("/quote")} labels={addLabels} />
          <Link href="#terminals" className="home-secondary">
            {page.jump}
          </Link>
        </div>
      </div>
      {/* Capped at the picture's own pixel width, so a small source is never upscaled (taste photo-upscale). */}
      {software.image && (
        <div
          className="sw-hero-art aims-studio"
          style={{ "--art-width": `${software.image.width}px` } as CSSProperties}
        >
          <Image
            src={software.image.src}
            alt={software.image.alt}
            width={software.image.width}
            height={software.image.height}
            sizes={`(min-width: 1024px) min(28rem, ${software.image.width}px), min(18rem, ${software.image.width}px)`}
            preload
          />
        </div>
      )}
    </section>
  );
}
