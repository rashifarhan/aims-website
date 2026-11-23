import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/home/ExternalLink";
import { ArrowIcon } from "@/components/icons";
import type { Software } from "@/content/schema";
import type { SoftwareType } from "@/content/taxonomy";

export type SoftwareCardLabels = {
  types: Record<SoftwareType, string>;
  purpose: string;
  open: string;
  external: string;
};

/**
 * One Download Centre card (Plan 12 #4) in the shared card (actions.css .ui-card): it lifts 2px and
 * its picture zooms on hover. The name is the link and its ::after covers the card, so the whole card
 * answers a click while the accessible name stays the platform's name (WCAG 2.5.3, as SolutionCard).
 * A built platform opens its page here; the others open AIMS's current page, marked ↗. The type sits
 * under the name as a fact, never as a label above it (impeccable craft floor: no eyebrows).
 */
export function SoftwareCard({
  software,
  enquiry,
  href,
  labels,
}: {
  software: Software;
  enquiry?: ReactNode;
  href: string | null;
  labels: SoftwareCardLabels;
}) {
  // The product name stays left-to-right inside Arabic; the ↗ mark outside it still mirrors (Design Doc 13).
  const name = (
    <span dir="ltr" translate="no">
      {software.name}
    </span>
  );
  return (
    <article className="sw-card ui-card ui-card-interactive">
      <div className="sw-card-image ui-card-photo">
        {software.image && (
          <Image
            src={software.image.src}
            alt=""
            width={software.image.width}
            height={software.image.height}
            sizes="(min-width: 1024px) 112px, 80px"
          />
        )}
      </div>
      <div className="sw-card-text">
        <h3 className="sw-card-name">
          {href ? (
            <Link href={href} className="sw-card-link">
              {name}
            </Link>
          ) : (
            <ExternalLink href={software.sourceUrl} label={labels.external} className="sw-card-link">
              {name}
            </ExternalLink>
          )}
        </h3>
        <p className="sw-card-purpose">{labels.purpose}</p>
        <p className="sw-card-types">{software.types.map((type) => labels.types[type]).join(" · ")}</p>
        {enquiry}
        {href && (
          <span className="sw-card-open" aria-hidden="true">
            {labels.open}
            <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
          </span>
        )}
      </div>
    </article>
  );
}
