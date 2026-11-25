import type { ReactNode } from "react";

/**
 * The one section header (design-taste-frontend one system; Design Doc 5): an h2 on the shared heading
 * token, an optional lead and an optional link at the end of the row (ui/sections.css .section-heading).
 * Night grounds recolour the title from their own section class. A plain-text title is marked for the GSAP reveal
 * (motion/HeadingReveal.tsx): its words rise out of masked lines as it scrolls into view.
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
        <h2 id={id} className="section-title" data-heading-reveal={typeof title === "string" || undefined}>
          {title}
        </h2>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {link}
    </div>
  );
}
