import type { ReactNode } from "react";
import { SplitWords } from "./SplitWords";

/**
 * The one section header (design-taste-frontend one system; Design Doc 5): an h2 on the shared heading
 * token, an optional lead and an optional link at the end of the row (ui/sections.css .section-heading).
 * Night grounds recolour the title from their own section class. A plain-text title rises word by word as it scrolls
 * into view (ui/reveal.css).
 */
export function SectionHeader({
  id,
  title,
  lead,
  link,
}: {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  link?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2 id={id} className="section-title">
          {typeof title === "string" ? <SplitWords text={title} /> : title}
        </h2>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {link}
    </div>
  );
}
