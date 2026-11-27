import type { AddToQuoteLabels } from "@/components/catalogue/AddToQuote";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import type { DataAttrs } from "@/components/product/englishData";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { absoluteUrl } from "@/lib/seo";

type Props = {
  p: Product;
  name: string;
  titleId: string;
  familyName: string;
  quoteHref: string;
  addLabels: AddToQuoteLabels;
  t: Dictionary;
  data: DataAttrs;
};

/**
 * A product page's first screen, bottom-start (direction 2): the purchase ticket. Cream, so the quantity, Add to quote
 * and WhatsApp keep their measured contrast; the H1 is the product's name, the model code in mono under it.
 */
export function ProductTicket({ p, name, titleId, familyName, quoteHref, addLabels, t, data }: Props) {
  return (
    <div className="in-ticket pt">
      <p className="pt-kicker in-mono">
        <span dir="ltr">{p.brand === "alpha" ? "Alpha" : "ZKTeco"}</span> · {familyName}
      </p>
      <h1 id={titleId} className="pt-title">
        <span {...data}>{name}</span>
      </h1>
      <p className="pt-model in-mono" dir="ltr" translate="no">
        {p.model}
      </p>
      <ProductPurchase
        slug={p.slug}
        name={p.name}
        model={p.model}
        quoteHref={quoteHref}
        whatsappMessage={fmt(t.product.whatsappText, { name: `${p.name} (${absoluteUrl(`/product/${p.slug}`)})` })}
        labels={{ ...addLabels, viewQuote: t.catalogue.viewQuote, askWhatsapp: t.product.askWhatsapp }}
      />
    </div>
  );
}
