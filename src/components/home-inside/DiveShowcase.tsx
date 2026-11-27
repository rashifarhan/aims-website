import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { productsInFamily } from "@/content/catalogue";
import { SHOWCASE } from "@/components/inside/showcase";
import { StagePill } from "@/components/inside/StagePill";
import { Ticket } from "@/components/inside/Ticket";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Inside the terminal's screen: the six product families, each a ticket, AIMS's photograph of a real model, one line
 * and a link to the family. Counts are read from the catalogue (CLAUDE.md, Truth). The arrows and word chips move the
 * scroll to a family (DiveMotion); the counter repeats the list, so it is hidden from screen readers.
 */
export async function DiveShowcase() {
  const t = await getDictionary();
  const locale = await getLocale();
  const i = t.home.inside;
  const n = SHOWCASE.length;
  return (
    <div className="dv-inside">
      <div className="dv-glass">
        <h2 className="dv-head in-mono" id="families-title">
          <span className="dv-counter" aria-hidden="true" dir="ltr">
            {fmt(i.counter, { n: pad(1), total: pad(n) })}
          </span>
          <span>{i.familiesLabel}</span>
        </h2>
        <ol className="dv-slides" aria-labelledby="families-title">
          {SHOWCASE.map((f, index) => {
            const copy = i.families[f.slug];
            const count = productsInFamily(f.slug).length;
            // --native caps the photograph near its own height, so a small source (the ZKAIO1000) never blurs.
            const ground = {
              "--ground": `var(--color-family-${f.slug})`,
              "--native": `${Math.round(f.image.h * 1.5)}px`,
            } as CSSProperties;
            return (
              <li key={f.slug} className="dv-slide" data-slide={index} style={ground}>
                <Ticket
                  className="dv-ticket"
                  title={t.families[f.slug].name}
                  rows={[
                    {
                      label: i.shown,
                      value: (
                        <Link href={localePath(locale, `/product/${f.productSlug}`)} className="dv-model" dir="ltr">
                          {f.model}
                        </Link>
                      ),
                    },
                    ...copy.facts.map((fact) => ({ label: fact.k, value: fact.v })),
                    { label: i.inRange, value: fmt(i.models, { count }) },
                  ]}
                />
                <div className="dv-product">
                  <Image
                    src={f.image.src}
                    alt={`ZKTeco ${f.model}`}
                    width={f.image.w}
                    height={f.image.h}
                    sizes="(min-width: 1024px) 40vw, 60vw"
                  />
                </div>
                <div className="dv-desc">
                  <p>{copy.line}</p>
                  <StagePill href={localePath(locale, `/products/${f.slug}`)}>{fmt(i.see, { count })}</StagePill>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="dv-arrows">
          <button type="button" className="in-round" data-dive-step="-1" aria-label={i.prev}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="rtl:-scale-x-100"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className="in-round" data-dive-step="1" aria-label={i.next}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="rtl:-scale-x-100"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className="dv-chips" role="group" aria-label={i.pick} dir="ltr">
          {SHOWCASE.map((f, index) => (
            <button key={f.slug} type="button" className="in-chip" data-dive-go={index} aria-current={index === 0}>
              {i.families[f.slug].word}
            </button>
          ))}
        </div>
        <div className="dv-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </div>
  );
}
