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
import { Ridges } from "@/components/ui/Ridges";
import "@/components/motion/entrance.css";

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
    <section className="product-hero aims-hero" aria-labelledby="product-title" data-enter>
      {/* One in-flow .wrap, the content line every section shares (layout-v4.md 2, SR-6). */}
      <div className="wrap">
        <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
        <div className="product-hero-grid">
          {/* On a short phone the stage is capped too, and the whole photo still shows inside it (audit B4). The
            photograph stands in the still studio light over the ridge motif, like every inner hero (premium pass,
            client decisions 5 and 7; product.css). */}
          <div className="product-stage aims-studio hero-enter-media">
            <Ridges className="product-hero-ridges" />
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

          {/* On phones the quantity and Add to quote follow the model chip, so the first action reaches the first
            screen (audit B4). The summary and spec tiles it passes hold no focusable element, so keyboard order
            still matches what is seen; desktop keeps the source order. */}
          <div className="min-w-0 max-lg:flex max-lg:flex-col">
            <p className="page-hero-eyebrow hero-enter">
              <span dir="ltr">{p.brand === "alpha" ? "Alpha" : "ZKTeco"}</span> · {familyName}
            </p>
            {/* The shared AIMS entrance (motion/entrance.css): the title rises from its mask. */}
            <h1
              id="product-title"
              className="aims-headline-mask ui-display mt-2 text-page-title-mobile leading-tight tracking-tight wrap-anywhere text-ink lg:text-page-title"
            >
              <span className="aims-headline" {...data}>
                {name}
              </span>
            </h1>
            <p className="hero-enter mt-3">
              <ModelChip model={p.model} />
            </p>
            <div className="hero-enter max-lg:order-1">
              <p
                className="product-hero-lead mt-4 max-w-[60ch] text-lg wrap-anywhere text-ink-600 rtl:text-end"
                {...data}
              >
                {p.summary}
              </p>
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
      </div>
    </section>
  );
}
