import { MarketLink } from "./MarketLink";
import { Section } from "@/components/ui/Section";
import type { Product } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";
import type { DataAttrs } from "./englishData";
import { Overview } from "./Overview";

type Props = {
  p: Pick<Product, "overview" | "datasheetUrl" | "model">;
  compareHref: string;
  t: Dictionary["product"];
  data: DataAttrs;
  ground: "paper" | "band";
};

/**
 * Overview and downloads in one section (Design Doc 10, T5; taste sections.md: no section without a
 * purpose): AIMS's overview copy beside the datasheet and the compare link, which moved here from the hero
 * so the hero keeps two actions (CLAUDE.md §2). Without overview copy the section is the downloads alone.
 */
export function ProductDetails({ p, compareHref, t, data, ground }: Props) {
  const hasOverview = p.overview.length > 0;
  const downloads = (
    <ul className="grid gap-2">
      <li>
        {p.datasheetUrl ? (
          <a
            href={p.datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="home-button home-button-outline max-w-full gap-2"
          >
            {t.datasheet}{" "}
            <span className="font-mono text-sm font-normal text-ink-600" dir="ltr">
              {p.model}
            </span>
          </a>
        ) : (
          <p className="text-ink-600">{t.noDatasheet}</p>
        )}
        {p.datasheetUrl && <p className="mt-2 text-sm text-ink-600">{t.datasheetNote}</p>}
      </li>
      <li>
        <MarketLink href={compareHref} className="home-secondary">
          {t.compareSimilar}
        </MarketLink>
      </li>
    </ul>
  );

  return (
    <Section ground={ground} labelledBy="overview">
      <h2 id="overview" className="section-title mb-8 lg:mb-10">
        {hasOverview ? t.overview : t.downloads}
      </h2>
      {hasOverview ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <Overview blocks={p.overview} data={data} />
          <div className="lg:border-s lg:border-line lg:ps-10">
            <h3 id="downloads" className="ui-display mb-4 text-home-subtitle leading-tight text-ink">
              {t.downloads}
            </h3>
            {downloads}
          </div>
        </div>
      ) : (
        downloads
      )}
    </Section>
  );
}
