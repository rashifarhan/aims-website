import Link from "next/link";
import { StagePill } from "@/components/inside/StagePill";
import { Ticket } from "@/components/inside/Ticket";
import type { DataAttrs } from "@/components/product/englishData";
import { keyFacts } from "@/content/facts";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";

type Props = {
  p: Product;
  familyName: string;
  familyHref: string;
  t: Dictionary;
  data: DataAttrs;
};

/** Key facts the ticket shows: the spec rows that tell models in this family apart (content/facts.ts). */
const FACTS = 6;

/**
 * The panel after the product's stage on its page (direction 2): the key specifications on a ticket, verbatim from
 * AIMS's spec table (CLAUDE.md, Truth), the product's own summary, and the ways on (the full table below, the family).
 * The model and brand always fill the ticket; the specifications section below says when AIMS publishes no rows.
 */
export function ProductInside({ p, familyName, familyHref, t, data }: Props) {
  const s = t.productsStage;
  const facts = keyFacts(p, FACTS);
  const rows = [
    { label: t.product.model, value: <span dir="ltr">{p.model}</span> },
    { label: t.product.brand, value: <span dir="ltr">{p.brand === "alpha" ? "Alpha" : "ZKTeco"}</span> },
    ...facts.map((f) => ({ label: f.label, value: <span {...data}>{f.value}</span> })),
  ];
  return (
    <div className="ps-glass ps-prod">
      <p className="ps-head in-mono">
        <span>{familyName}</span>
      </p>
      <div className="ps-prod-grid">
        {/* A named region, so the key facts can be found by landmark (as the T5 hero's key specs were). */}
        <section aria-labelledby="key-specs">
          <Ticket title={t.product.keySpecs} titleAs="h2" titleId="key-specs" rows={rows} className="ps-ticket" />
        </section>
        <div className="ps-prod-copy">
          <p className="in-lead" {...data}>
            {p.summary}
          </p>
          <p className="ps-prod-links">
            <Link href={familyHref} className="in-link">
              {fmt(t.product.inFamily, { family: familyName })}
            </Link>
          </p>
        </div>
      </div>
      <div className="ps-bottom">
        <StagePill href="#specs">{s.fullSpecs}</StagePill>
      </div>
    </div>
  );
}
