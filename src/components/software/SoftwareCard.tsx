import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/home/ExternalLink";
import type { Software } from "@/content/schema";
import type { SoftwareType } from "@/content/taxonomy";

export type SoftwareCardLabels = {
  types: Record<SoftwareType, string>;
  purpose: string;
  open: string;
  external: string;
};

/**
 * One Download Centre card (Plan 12 #4; taste cards.md: one card style, the whole card linked).
 * A built platform opens its page here; the others open AIMS's current page, marked ↗.
 */
export function SoftwareCard({
  software,
  href,
  labels,
}: {
  software: Software;
  href: string | null;
  labels: SoftwareCardLabels;
}) {
  const body = (
    <>
      <span className="sw-card-image">
        {software.image && (
          <Image
            src={software.image.src}
            alt=""
            width={software.image.width}
            height={software.image.height}
            sizes="(min-width: 1024px) 120px, 96px"
          />
        )}
      </span>
      <span className="sw-card-text">
        <span className="home-software-kind">{software.types.map((type) => labels.types[type]).join(" · ")}</span>
        <span className="sw-card-name" dir="ltr">
          {software.name}
        </span>
        <span className="home-software-purpose">{labels.purpose}</span>
        {href && (
          <span className="sw-card-open" aria-hidden="true">
            {labels.open}
          </span>
        )}
      </span>
    </>
  );
  return href ? (
    <Link href={href} className="home-software-card sw-card">
      {body}
    </Link>
  ) : (
    <ExternalLink href={software.sourceUrl} label={labels.external} className="home-software-card sw-card">
      {body}
    </ExternalLink>
  );
}
