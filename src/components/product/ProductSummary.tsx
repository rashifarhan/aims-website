import Image from "next/image";
import Link from "next/link";
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

type Props = {
  p: Product;
  name: string;
  familyName: string;
  href: (path: string) => string;
  addLabels: AddToQuoteLabels;
  t: Dictionary;
  data: DataAttrs;
};

/**
 * Photo, name, summary, key specs and the page's one filled action (Design Doc 10, T5). It is the page's
 * hero, so it enters once on load like every other (ui/sections.css .hero-enter; CLAUDE.md §3).
 */
export function ProductSummary({ p, name, familyName, href, addLabels, t, data }: Props) {
  const image = p.images[0];
  return (
    <div
      className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14"
      data-enter
    >
      {/* 4:3 below 1024px so the name and first action reach the first screen sooner (audit T3). */}
      <div className="hero-enter-media relative aspect-4/3 overflow-hidden rounded-lg border border-line bg-white lg:aspect-square">
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

      <div className="min-w-0">
        <p className="hero-enter text-brand font-semibold tracking-brand text-ink-600 uppercase">
          <span dir="ltr">{p.brand === "alpha" ? "Alpha" : "ZKTeco"}</span> · {familyName}
        </p>
        <h1 className="hero-enter mt-2 text-page-title-mobile leading-tight font-display tracking-tight wrap-anywhere text-ink lg:text-page-title">
          <span {...data}>{name}</span>
        </h1>
        <p className="hero-enter mt-3">
          <ModelChip model={p.model} />
        </p>
        <p className="hero-enter mt-4 max-w-[60ch] text-lg wrap-anywhere text-ink-600" {...data}>
          {p.summary}
        </p>

        <KeySpecs tiles={keyFacts(p, 4)} heading={t.product.keySpecs} data={data} />

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
            <Link href={href(`/products/${p.family}?cmp=${p.slug}`)} className="home-secondary">
              {t.product.compareSimilar}
            </Link>
          </li>
        </ul>

        <div className="ui-panel mt-6">
          <p className="font-semibold text-ink">{t.product.needInstall}</p>
          <p className="mt-1 text-sm text-ink-600">{t.product.needInstallBody}</p>
        </div>
      </div>
    </div>
  );
}
