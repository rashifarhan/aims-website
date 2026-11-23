import Image from "next/image";
import Link from "next/link";
import { AddToQuote } from "@/components/catalogue/AddToQuote";
import { fmt } from "@/i18n/format";
import { terminalsFor } from "@/content/softwarePages";
import type { Product } from "@/content/schema";
import type { BuiltSoftware } from "@/lib/software";
import { SoftwareSignal, type SignalNode } from "./SoftwareSignal";
import { loadSoftwarePage } from "./softwareCopy";
import { Section } from "@/components/ui/Section";

type Loaded = Awaited<ReturnType<typeof loadSoftwarePage>>;

/** One terminal in the shared card (actions.css): photo, model code as the link, outline Add. */
function terminalCard(p: Product, { t, href }: Loaded): SignalNode {
  const image = p.images[0];
  const productHref = href(`/product/${p.slug}`);
  const labels = {
    add: t.catalogue.add,
    inQuote: t.catalogue.inQuote,
    addedAnnounce: t.catalogue.addedAnnounce,
    qtyAnnounce: t.catalogue.qtyAnnounce,
    qty: t.catalogue.qty,
    decrease: t.catalogue.decrease,
    increase: t.catalogue.increase,
  };
  return {
    key: p.slug,
    content: (
      <article className="sw-terminal ui-card ui-card-interactive">
        <Link href={productHref} tabIndex={-1} aria-hidden="true" className="sw-terminal-image ui-card-photo">
          {image && <Image src={image.src} alt="" width={image.width} height={image.height} sizes="72px" />}
        </Link>
        <div className="sw-terminal-text">
          <h3>
            {/* Model codes in Plex Mono and left-to-right inside Arabic (Design Doc 5, 13). */}
            <Link href={productHref} dir="ltr" translate="no" className="sw-terminal-model">
              {p.model}
            </Link>
          </h3>
          <AddToQuote slug={p.slug} name={p.name} labels={labels} variant="outline" />
        </div>
      </article>
    ),
  };
}

/**
 * T6 detail, "works with which devices" (Plan 12 #29–31), and the page's dealt moment (SIGNAL).
 * BioTime 9.5 and ZKAccess 3.5 draw lines to the terminals whose own AIMS product text names them.
 * No AIMS product page names BioTime Cloud, so it names no terminal: its lines reach the ways in
 * that its own feature list gives (browser, mobile app, branches, attendance devices), and its copy
 * asks buyers to confirm cloud support (CLAUDE.md §1: no inferred compatibility).
 */
export async function SoftwareTerminals({ slug }: { slug: BuiltSoftware }) {
  const loaded = await loadSoftwarePage(slug);
  const { software, c, href } = loaded;
  const cloud = slug === "biotimecloud";
  const terminals = terminalsFor(slug);
  const nodes: SignalNode[] = cloud
    ? c.terminals.cloudNodes.map((text) => ({ key: text, content: <span className="sw-signal-pill">{text}</span> }))
    : terminals.map((p) => terminalCard(p, loaded));
  const names = cloud ? c.terminals.cloudNodes : terminals.map((p) => p.model);
  return (
    <Section id="terminals" labelledBy="sw-terminals-title" className="sw-screen">
      <div className="sw-split">
        <div>
          <h2 id="sw-terminals-title" className="section-title">
            {cloud ? c.terminals.cloudHeading : fmt(c.terminals.heading, { name: software.name })}
          </h2>
          <p className="section-lead">
            {cloud ? c.terminals.cloudLead : fmt(c.terminals.lead, { name: software.name })}
          </p>
          {cloud && (
            <Link href={href("/products/time-attendance")} className="home-text-link">
              {c.terminals.cloudAll}
            </Link>
          )}
        </div>
        <SoftwareSignal
          source={software.name}
          nodes={nodes}
          size={cloud ? "chip" : "card"}
          label={fmt(c.terminals.diagram, { name: software.name, nodes: names.join(", ") })}
        />
      </div>
    </Section>
  );
}
