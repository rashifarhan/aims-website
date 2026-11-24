"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { SOFTWARE_TYPES, type SoftwareType } from "@/content/taxonomy";
import { countLabel } from "@/i18n/format";
import { typeFromParam } from "@/lib/software";
import { ResultCount } from "@/components/catalogue/ResultCount";
import { SpotlightGroup } from "@/components/ui/SpotlightGroup";

export type SoftwareFilterItem = { slug: string; types: SoftwareType[]; card: ReactNode };
export type SoftwareFilterLabels = {
  label: string;
  all: string;
  types: Record<SoftwareType, string>;
  count: string;
  countOne: string;
};

type ViewProps = {
  items: SoftwareFilterItem[];
  basePath: string;
  labels: SoftwareFilterLabels;
  active: SoftwareType | null;
};

/**
 * The chips and the grid. Server-rendered unfiltered as the Suspense fallback, so it never shifts.
 * Chips are the shared small outline button (actions.css); the active one is marked aria-current and
 * tinted, never filled, so the page keeps one filled action per screen. A filter change answers with
 * the catalogue's count tick (ResultCount); the cards never animate (taste motion.md).
 */
export function SoftwareFilterView({ items, basePath, labels, active }: ViewProps) {
  const shown = active ? items.filter((i) => i.types.includes(active)) : items;
  const chips: { type: SoftwareType | null; label: string }[] = [
    { type: null, label: labels.all },
    ...SOFTWARE_TYPES.map((type) => ({ type, label: labels.types[type] })),
  ];
  return (
    <>
      <nav aria-label={labels.label} className="sw-filter">
        <ul>
          {chips.map(({ type, label }) => (
            <li key={label}>
              <Link
                href={type ? `${basePath}?type=${type}` : basePath}
                scroll={false}
                prefetch={false}
                aria-current={type === active ? "page" : undefined}
                className="ui-chip"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <ResultCount
          count={shown.length}
          cause={active ?? ""}
          text={countLabel(shown.length, labels.countOne, labels.count)}
        />
      </nav>
      <SpotlightGroup className="sw-card-grid-wrap">
        <ul className="sw-card-grid">
          {shown.map((item) => (
            <li key={item.slug}>{item.card}</li>
          ))}
        </ul>
      </SpotlightGroup>
    </>
  );
}

/**
 * Filter state lives in the URL (CLAUDE.md §8; Plan 12: /swcategory/* → /software?type=), read with
 * Zod-backed `typeFromParam`; an unknown type shows everything.
 */
export function SoftwareFilter(props: Omit<ViewProps, "active">) {
  const active = typeFromParam(useSearchParams().get("type"));
  return <SoftwareFilterView {...props} active={active} />;
}
