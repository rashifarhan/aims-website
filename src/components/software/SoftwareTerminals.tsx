import Image from "next/image";
import Link from "next/link";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { fmt } from "@/i18n/format";
import { terminalsFor } from "@/content/softwarePages";
import type { BuiltSoftware } from "@/lib/software";
import { SoftwareHub } from "./SoftwareHub";
import { loadSoftwarePage } from "./softwareCopy";

/**
 * T6 detail, "works with which devices" (Plan 12 #29–31), and the page's dealt moment. BioTime 9.5
 * and ZKAccess 3.5 list only terminals whose AIMS product text names them; BioTime Cloud is named by
 * no product page, so its hub shows how it is reached (from its own feature list) and its copy asks
 * buyers to confirm cloud support (CLAUDE.md §1).
 */
export async function SoftwareTerminals({ slug }: { slug: BuiltSoftware }) {
  const { software, t, c, href } = await loadSoftwarePage(slug);
  const cloud = slug === "biotimecloud";
  const terminals = terminalsFor(slug);
  const nodes = cloud ? c.terminals.cloudNodes : terminals.map((p) => p.model);
  const labels = {
    add: t.catalogue.add,
    inQuote: t.catalogue.inQuote,
    addedAnnounce: t.catalogue.addedAnnounce,
    qtyAnnounce: t.catalogue.qtyAnnounce,
    qty: t.catalogue.qty,
    decrease: t.catalogue.decrease,
    increase: t.catalogue.increase,
  };
  return (
    <section
      id="terminals"
      className="sw-section sw-screen sw-band page-container"
      aria-labelledby="sw-terminals-title"
      data-moment
    >
      <div className="t3-heading t3-heading-row">
        <div>
          <h2 id="sw-terminals-title" className="t3-title">
            {cloud ? c.terminals.cloudHeading : fmt(c.terminals.heading, { name: software.name })}
          </h2>
          <p className="t3-lead">{cloud ? c.terminals.cloudLead : fmt(c.terminals.lead, { name: software.name })}</p>
        </div>
        {cloud && (
          <Link href={href("/products/time-attendance")} className="home-text-link">
            {c.terminals.cloudAll}
          </Link>
        )}
      </div>
      <div className="sw-terminals">
        <SoftwareHub
          centre={software.name}
          nodes={nodes}
          mono={!cloud}
          label={fmt(c.terminals.diagram, { name: software.name, nodes: nodes.join(", ") })}
        />
        <ul className="sw-terminal-grid">
          {terminals.map((p) => {
            const image = p.images[0];
            const productHref = href(`/product/${p.slug}`);
            return (
              <li key={p.slug} className="pick-card">
                <Link href={productHref} tabIndex={-1} aria-hidden="true" className="pick-image sw-terminal-image">
                  {image && (
                    <Image
                      src={image.src}
                      alt=""
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 160px, 140px"
                    />
                  )}
                </Link>
                <h3>
                  <Link href={productHref} dir="ltr">
                    {p.model}
                  </Link>
                </h3>
                <AddToQuote slug={p.slug} name={p.name} labels={labels} className="pick-add" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
