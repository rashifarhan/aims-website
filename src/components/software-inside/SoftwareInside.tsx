import type { ReactNode } from "react";
import { StagePill } from "@/components/inside/StagePill";
import { Ticket } from "@/components/inside/Ticket";
import type { Software } from "@/content/schema";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  software: Software;
  t: Dictionary;
  jump: string;
  /** The page's Add to quote, on cream so its states keep their contrast. */
  addToQuote: ReactNode;
};

/**
 * What opens out of a software page's screen (direction 2): the platform on a ticket (its name and types, from
 * content/software.json), its summary, Add to quote, and the way down to the terminals it works with.
 */
export function SoftwareInside({ software, t, jump, addToQuote }: Props) {
  const c = t.softwareCentre;
  const rows = [
    { label: t.product.brand, value: <span dir="ltr">ZKTeco</span> },
    ...software.types.map((type) => ({ label: t.softwareStage.rowType, value: c.types[type] })),
  ];
  return (
    <div className="ps-glass ps-prod">
      <p className="ps-head in-mono">
        <span>{t.softwarePage.software}</span>
        <span dir="ltr">{software.name}</span>
      </p>
      <div className="ps-prod-grid">
        <Ticket title={software.name} titleAs="h2" rows={rows} className="ps-ticket" />
        <div className="ps-prod-copy">
          <p className="in-lead">{software.summary}</p>
          <div className="ps-buy">{addToQuote}</div>
        </div>
      </div>
      <div className="ps-bottom">
        <StagePill href="#terminals">{jump}</StagePill>
      </div>
    </div>
  );
}
