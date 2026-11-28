import Image from "next/image";
import Link from "next/link";
import { StagePill } from "@/components/inside/StagePill";
import { Ticket } from "@/components/inside/Ticket";
import { toCard } from "@/content/cards";
import { productsInFamily } from "@/content/catalogue";
import { PRODUCT_TYPES, type FamilySlug } from "@/content/taxonomy";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { familyFacts } from "@/lib/familyFacts";
import { FAMILY_STAGES, type ProductStage } from "./stages";

/**
 * Inside the product's screen on a family page: a ticket of the family's facts, every figure counted from the
 * catalogue (familyFacts; CLAUDE.md, Truth), the product, and shortcuts that show the list below already filtered.
 * A solution page opens the same inside out of its own product (`stage`); its shortcuts open the family's list.
 */
export async function FamilyInside({
  family,
  stage = FAMILY_STAGES[family],
}: {
  family: FamilySlug;
  stage?: ProductStage;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.productsStage;
  const c = t.catalogue;
  const facts = familyFacts(productsInFamily(family).map(toCard), PRODUCT_TYPES);
  const listing = localePath(locale, `/products/${family}`);
  const name = t.families[family].name;
  const join = (parts: string[]) => parts.join(" · ");

  const rows = [
    {
      label: s.rowShown,
      value: (
        <Link href={localePath(locale, `/product/${stage.productSlug}`)} className="ps-model" dir="ltr">
          {stage.model}
        </Link>
      ),
    },
    ...(facts.verify.length
      ? [{ label: s.rowVerifies, value: join(facts.verify.map((v) => `${c.verify[v.value]} ${v.count}`)) }]
      : []),
    ...facts.types.map((ty) => ({ label: c.types[ty.value], value: fmt(s.familyCount, { count: ty.count }) })),
    ...(facts.outdoor ? [{ label: s.rowOutdoor, value: fmt(s.familyCount, { count: facts.outdoor }) }] : []),
    { label: s.rowBrand, value: join(facts.brands.map((b) => `${c.brands[b.value]} ${b.count}`)) },
  ];

  const jumps = [
    ...facts.types.map((ty) => ({
      key: ty.value,
      label: c.types[ty.value],
      count: ty.count,
      query: `type=${ty.value}`,
    })),
    ...facts.verify
      .slice(0, 4)
      .map((v) => ({ key: v.value, label: c.verify[v.value], count: v.count, query: `verify=${v.value}` })),
    ...(facts.outdoor ? [{ key: "outdoor", label: s.rowOutdoor, count: facts.outdoor, query: "outdoor=1" }] : []),
  ].slice(0, 5);

  return (
    <div className="ps-glass ps-fam">
      <p className="ps-head in-mono">
        <span>{fmt(s.familyCount, { count: facts.total })}</span>
        <span>{fmt(s.insideHead, { model: stage.model })}</span>
      </p>
      <div className="ps-fam-grid">
        <div className="ps-fam-copy">
          <Ticket title={name} titleAs="h2" rows={rows} className="ps-ticket" />
          <p className="ps-line">{t.families[family].summary}.</p>
        </div>
        <div className="ps-show" aria-hidden="true">
          <Image src={stage.image.src} alt="" width={stage.image.w} height={stage.image.h} sizes="420px" />
        </div>
      </div>
      <div className="ps-bottom">
        <StagePill href={listing}>{fmt(s.seeAll, { count: facts.total })}</StagePill>
        {jumps.length > 0 && (
          <div className="ps-jumps" role="group" aria-label={s.jumpTo}>
            <span className="in-mono" aria-hidden="true">
              {s.jumpTo}
            </span>
            {jumps.map((j) => (
              <Link key={j.key} href={`${listing}?${j.query}`} className="in-chip" prefetch={false}>
                {j.label} <b>{j.count}</b>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
