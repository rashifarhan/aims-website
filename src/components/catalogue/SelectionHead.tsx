"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/icons";

export type TypeChip = { value: string; label: string; count: number; pressed: boolean };

type Props = {
  title: string;
  /** The family page's own URL, offered when a category is picked on the hub. */
  link?: { href: string; label: string };
  /** A family's sub-types as one-click chips; "All" clears them. */
  types?: { label: string; all: { label: string; count: number; pressed: boolean }; chips: TypeChip[] };
  onType?: (value: string | undefined) => void;
  /** Shown when no family is chosen (the "Popular" quick picks). */
  children?: ReactNode;
};

/**
 * The heading over the results: the chosen category's name (it is the results heading that pagination focuses),
 * then its sub-types as chips, so a buyer goes category → type → product in two clicks (owner, 27 Nov 2026).
 */
export function SelectionHead({ title, link, types, onType, children }: Props) {
  return (
    <div className="sel-head">
      <div className="sel-row">
        <h2 id="results-heading" tabIndex={-1} className="sel-title scroll-mt-28">
          {title}
        </h2>
        {link && (
          <Link href={link.href} className="flood-link">
            {link.label}
            <ArrowIcon width="16" height="16" className="rtl:-scale-x-100" />
          </Link>
        )}
      </div>
      {types && types.chips.length > 1 && onType ? (
        <div role="group" aria-label={types.label} className="sel-chips">
          <button type="button" className="sel-chip" aria-pressed={types.all.pressed} onClick={() => onType(undefined)}>
            {types.all.label} <span className="sel-chip-count">{types.all.count}</span>
          </button>
          {types.chips.map((c) => (
            <button
              key={c.value}
              type="button"
              className="sel-chip"
              aria-pressed={c.pressed}
              onClick={() => onType(c.pressed ? undefined : c.value)}
            >
              {c.label} <span className="sel-chip-count">{c.count}</span>
            </button>
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
