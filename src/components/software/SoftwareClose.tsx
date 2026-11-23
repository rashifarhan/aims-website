import Link from "next/link";
import { fmt } from "@/i18n/format";
import type { BuiltSoftware } from "@/lib/software";
import { AddSoftwareToQuote } from "./AddSoftwareToQuote";
import { loadSoftwarePage } from "./softwareCopy";

/** T6 detail, closing band: the hero's main action again, worded the same, and one link (Design Doc 2). */
export async function SoftwareClose({ slug }: { slug: BuiltSoftware }) {
  const { software, c, addLabels, href } = await loadSoftwarePage(slug);
  return (
    <section className="t3-cta wrap" aria-labelledby="sw-close-title">
      <div className="t3-cta-panel">
        <div>
          <h2 id="sw-close-title" className="t3-title">
            {fmt(c.close.heading, { name: software.name })}
          </h2>
          <p className="t3-lead">{c.close.body}</p>
        </div>
        <div className="t3-cta-actions">
          <AddSoftwareToQuote slug={slug} name={software.name} quoteHref={href("/quote")} labels={addLabels} />
          <Link href={href("/software")} className="home-text-link">
            {c.close.all}
          </Link>
        </div>
      </div>
    </section>
  );
}
