import Image from "next/image";
import type { AddToQuoteLabels } from "@/components/catalogue/AddToQuote";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { keyFacts } from "@/content/facts";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { absoluteUrl } from "@/lib/seo";
import type { DataAttrs } from "./englishData";
import { KeySpecs } from "./KeySpecs";
import { ModelChip } from "./ModelChip";
import { ProductPurchase } from "./ProductPurchase";

type Props = {
  p: Product;
  name: string;
  familyName: string;
  crumbs: Crumb[];
  href: (path: string) => string;
  addLabels: AddToQuoteLabels;
  t: Dictionary;
  data: DataAttrs;
};

/**
 * The T5 hero (Design Doc 10, T5; taste sections.md "Every product page"): AIMS's own photograph big and
 * whole on a lit ground, no box, beside the name, model code, lead, key specs and two actions (quantity +
 * Add to quote, Ask on WhatsApp; CLAUDE.md §2 "at most two actions"). The datasheet, compare link and
 * install note sit lower on the page. It enters once on load and then stands (ui/sections.css .hero-enter).
 */
export function ProductSummary({ p, name, familyName, crumbs, href, addLabels, t, data }: Props) {
  const image = p.images[0];
  return (
    <section className="product-hero wrap" aria-labelledby="product-title" data-enter>
      <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
      <div className="product-hero-grid">
        <div className="product-stage hero-enter-media">
          {image && (
            // The LCP element: the only preloaded image on the page (CLAUDE.md §5).
            <Image
              src={image.src}
              alt={image.alt}
              fill
              preload
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="product-stage-photo"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="hero-enter text-brand font-semibold tracking-brand text-ink-600 uppercase">
            <span dir="ltr">{p.brand === "alpha" ? "Alpha" : "ZKTeco"}</span> · {familyName}
          </p>
          <h1
            id="product-title"
            className="hero-enter mt-2 text-page-title-mobile leading-tight font-display tracking-tight wrap-anywhere text-ink lg:text-page-title"
          >
            <span {...data}>{name}</span>
          </h1>
          <p className="hero-enter mt-3">
            <ModelChip model={p.model} />
          </p>
          <p className="hero-enter mt-4 max-w-[60ch] text-lg wrap-anywhere text-ink-600" {...data}>
            {p.summary}
          </p>
          <div className="hero-enter">
            <KeySpecs tiles={keyFacts(p, 4)} heading={t.product.keySpecs} data={data} />
          </div>
          <div className="hero-enter">
            <ProductPurchase
              slug={p.slug}
              name={p.name}
              model={p.model}
              quoteHref={href("/quote")}
              whatsappMessage={fmt(t.product.whatsappText, {
                name: `${p.name} (${absoluteUrl(`/product/${p.slug}`)})`,
              })}
              labels={{ ...addLabels, viewQuote: t.catalogue.viewQuote, askWhatsapp: t.product.askWhatsapp }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
