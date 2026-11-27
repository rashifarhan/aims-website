"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { GiantWord } from "@/components/families/GiantWord";
import type { FamilySlug } from "@/content/taxonomy";

export type PickerItem = {
  slug: FamilySlug;
  name: string;
  count: string;
  word: string;
  wordEm: number;
  ground: string;
  hero: { src: string; w: number; h: number };
  tileWidth: number;
};

type Props = {
  label: string;
  all: { name: string; count: string };
  items: PickerItem[];
  selected?: FamilySlug;
  onSelect: (family: FamilySlug | undefined) => void;
};

/**
 * The hub's six major categories (owner, 27 Nov 2026: "pick a category and see the products under it"): a row of
 * family tiles that filter the list below in place. They are toggle buttons (`aria-pressed`), and the choice lives in
 * the URL (`?family=`), so Back and a shared link restore it. The family pages stay the categories' own URLs.
 */
export function CategoryPicker({ label, all, items, selected, onSelect }: Props) {
  return (
    <nav aria-label={label} className="cat-picker">
      <ul>
        <li>
          <button
            type="button"
            className="cat-tile cat-all"
            aria-pressed={!selected}
            onClick={() => onSelect(undefined)}
          >
            <span className="cat-swatches" aria-hidden="true">
              {items.map((f) => (
                <i key={f.slug} style={{ background: f.ground }} />
              ))}
            </span>
            <span className="cat-foot">
              <span className="cat-name">{all.name}</span>
              <span className="cat-count">{all.count}</span>
            </span>
          </button>
        </li>
        {items.map((f) => (
          <li key={f.slug}>
            <button
              type="button"
              className="cat-tile"
              aria-pressed={selected === f.slug}
              onClick={() => onSelect(selected === f.slug ? undefined : f.slug)}
              style={{ "--ground": f.ground, "--w": `${f.tileWidth}%` } as CSSProperties}
            >
              <GiantWord word={f.word} em={f.wordEm} className="cat-word" />
              <span className="cat-product" aria-hidden="true">
                <Image
                  src={f.hero.src}
                  alt=""
                  width={f.hero.w}
                  height={f.hero.h}
                  sizes="(min-width: 1024px) 9vw, 30vw"
                />
              </span>
              <span className="cat-foot">
                <span className="cat-name">{f.name}</span>
                <span className="cat-count">{f.count}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
