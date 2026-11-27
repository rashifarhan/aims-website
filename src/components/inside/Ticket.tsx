import type { ReactNode } from "react";

export type TicketRow = { label: string; value: ReactNode };

/**
 * The ticket card (CLAUDE.md → Design rules, Components): every spec, fact and step panel of direction 2. The rows
 * are a description list, so each label reads with its value.
 */
export function Ticket({
  title,
  titleAs: Title = "h3",
  rows,
  className,
}: {
  title: ReactNode;
  titleAs?: "h2" | "h3" | "p";
  rows: TicketRow[];
  className?: string;
}) {
  return (
    <div className={`in-ticket ${className ?? ""}`}>
      <Title className="in-ticket-title">{title}</Title>
      <dl className="in-ticket-rows">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
