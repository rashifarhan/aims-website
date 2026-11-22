import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BuiltSoftware } from "@/lib/software";
import { AddSoftwareToQuote } from "./AddSoftwareToQuote";
import { loadSoftwarePage } from "./softwareCopy";

/**
 * T6 detail, first screen (Plan 14; taste layout-v4 §3): the h1 names the platform and its category,
 * the lead says what it does and where AIMS sets it up (the hard fact), two actions, and AIMS's own
 * product image whole beside the words. Enters once on load (taste motion.md).
 */
export async function SoftwareHero({ slug }: { slug: BuiltSoftware }) {
  const { software, t, c, page, addLabels, href } = await loadSoftwarePage(slug);
  const type = software.types[0];
  return (
    <section className="sw-hero page-container" aria-labelledby="sw-title" data-enter>
      <div className="sw-hero-text">
        <Breadcrumbs
          label={t.common.breadcrumb}
          items={[
            { href: href("/"), label: t.common.home },
            { href: href("/software"), label: c.software },
            { href: href(`/software/${slug}`), label: software.name },
          ]}
        />
        {type && <p className="t3-eyebrow">{c.eyebrow[type]}</p>}
        <h1 id="sw-title">{page.title}</h1>
        <p className="t3-promise">{page.lead}</p>
        <div className="t3-actions">
          <AddSoftwareToQuote slug={slug} name={software.name} quoteHref={href("/quote")} labels={addLabels} />
          <Link href="#terminals" className="home-secondary">
            {page.jump}
          </Link>
        </div>
      </div>
      {software.image && (
        <div className="sw-hero-art">
          <Image
            src={software.image.src}
            alt={software.image.alt}
            width={software.image.width}
            height={software.image.height}
            sizes="(min-width: 1024px) 420px, 280px"
            priority
          />
        </div>
      )}
    </section>
  );
}
