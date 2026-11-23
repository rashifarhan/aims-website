import Image from "next/image";
import { MarketLink } from "./MarketLink";
import type { AddToQuoteLabels } from "@/components/catalogue/AddToQuote";
import { keyFacts } from "@/content/facts";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { absoluteUrl } from "@/lib/seo";
import type { DataAttrs } from "./englishData";
import { KeySpecs } from "./KeySpecs";
import { ModelChip } from "./ModelChip";
import { ProductPurchase } from "./ProductPurchase";
import "@/components/motion/entrance.css";

type Props = {
  p: Product;
  name: string;
  familyName: string;
  href: (path: string) => string;
  addLabels: AddToQuoteLabels;
  t: Dictionary;
  data: DataAttrs;
};

/** Photo, name, summary, key specs and the page's one filled action (Design Doc 10, T5). */
export function ProductSummary({ p, name, familyName, href, addLabels, t, data }: Props) {
  const image = p.images[0];
  return (
    <div className="aims-hero product-hero-grid mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
      {/* 4:3 below 1024px so the name and first action reach the first screen sooner (audit T3); on a short phone
          the frame is capped too, and the whole photo still shows inside it (object-contain). */}
      <div className="product-hero-art product-hero-frame aims-studio relative aspect-4/3 overflow-hidden rounded-lg border border-line bg-white lg:aspect-square">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-contain p-6 lg:p-8"
          />
        )}
      </div>

      {/* On phones the quantity and Add to quote follow the model chip, so the first action reaches the first
          screen (audit B4). The summary and spec tiles it passes hold no focusable element, so keyboard order still
          matches what is seen; desktop keeps the source order. */}
      <div className="min-w-0 max-lg:flex max-lg:flex-col">
        <p className="text-brand font-semibold tracking-brand text-ink-600 uppercase">
          <span dir="ltr">{p.brand === "alpha" ? "Alpha" : "ZKTeco"}</span> · {familyName}
        </p>
        <h1 className="aims-headline-mask mt-2 text-3xl leading-tight font-bold tracking-tight wrap-anywhere text-ink sm:text-4xl lg:text-5xl">
          <span className="aims-headline" {...data}>
            {name}
          </span>
        </h1>
        <p className="mt-3">
          <ModelChip model={p.model} />
        </p>
        <div className="max-lg:order-1">
          <p className="product-hero-lead mt-4 max-w-[60ch] text-lg wrap-anywhere text-ink-600" {...data}>
            {p.summary}
          </p>

          <KeySpecs tiles={keyFacts(p, 4)} heading={t.product.keySpecs} data={data} />
        </div>

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

        <div className="max-lg:order-2">
          {/* Text actions are 44px tall targets (CLAUDE.md 4; audit T3). */}
          <ul className="mt-1 flex flex-wrap gap-x-6 text-sm">
            {p.datasheetUrl && (
              <li>
                <a href={p.datasheetUrl} target="_blank" rel="noopener noreferrer" className="home-secondary">
                  {t.product.datasheet}
                  <span className="ms-1 font-normal text-ink-600">· {t.product.datasheetNote}</span>
                </a>
              </li>
            )}
            <li>
              <MarketLink href={href(`/products/${p.family}?cmp=${p.slug}`)} className="home-secondary">
                {t.product.compareSimilar}
              </MarketLink>
            </li>
          </ul>

          <div className="mt-6 rounded-md border border-line p-4">
            <p className="font-semibold text-ink">{t.product.needInstall}</p>
            <p className="mt-1 text-sm text-ink-600">{t.product.needInstallBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
