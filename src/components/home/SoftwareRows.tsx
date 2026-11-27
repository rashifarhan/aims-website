"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type SoftwareRow = {
  slug: string;
  name: string;
  image: { src: string; width: number; height: number } | null;
  runs: string;
  purpose: string;
  href: string;
};

/**
 * The software rows and the white card beside them, which shows AIMS's image of the row under the pointer or the
 * keyboard (Design rules → Imagery: software on white cards). The card is decoration; each row's link carries the
 * name. Phones show the rows only.
 */
export function SoftwareRows({ rows }: { rows: SoftwareRow[] }) {
  const [active, setActive] = useState(0);
  const shown = rows[active] ?? rows[0];
  return (
    <div className="hsw">
      <ul className="hsw-rows">
        {rows.map((r, i) => (
          <li key={r.slug} data-active={i === active}>
            <Link href={r.href} className="hsw-row" onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>
              <span className="hsw-name" dir="ltr">
                {r.name}
              </span>
              <span className="hsw-runs">{r.runs}</span>
              <span className="hsw-purpose">{r.purpose}</span>
            </Link>
          </li>
        ))}
      </ul>
      {shown && (
        <div className="hsw-card" aria-hidden="true">
          {rows.map((r) =>
            r.image ? (
              <Image
                key={r.slug}
                src={r.image.src}
                alt=""
                width={r.image.width}
                height={r.image.height}
                sizes="(min-width: 1024px) 34vw, 1px"
                data-shown={r.slug === shown.slug}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
