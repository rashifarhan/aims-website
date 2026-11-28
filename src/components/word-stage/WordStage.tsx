import Link from "next/link";
import { isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { StagePill } from "@/components/inside/StagePill";
import { Ticket, type TicketRow } from "@/components/inside/Ticket";
import { getDictionary } from "@/i18n/dictionaries";
import "@/components/inside/inside.css";
import "./word-stage.css";

type Action = { href: string; label: string };

type Props = {
  id: string;
  /** The giant word; left out on a form page (`compact`), where the form is what the visitor came for. */
  word?: string;
  crumbs: Crumb[];
  title: string;
  lead: string;
  primary?: Action | ReactElement;
  secondary?: Action;
  fact?: ReactNode;
  /** Facts on a cream ticket at the end side: only what src/lib/site.ts states (CLAUDE.md, Truth). */
  ticket?: { title: string; rows: TicketRow[]; note?: string };
  /** A form page (contact, quote) keeps its stage short and wordless, so the form starts on the first screen
   * (client decision, 28 Nov 2026: nothing stands between a visitor and what they came to do). */
  compact?: boolean;
};

/**
 * The first screen of a company page, direction 2 (CLAUDE.md → Design rules): the night stage and its giant word, the
 * H1, lead and actions bottom-start, and the page's facts on a ticket at the end. No product dive: these pages have
 * no product to step into, so the stage holds its words and facts (README → Decisions).
 */
export async function WordStage({ id, word, crumbs, title, lead, primary, secondary, fact, ticket, compact }: Props) {
  const t = await getDictionary();
  return (
    <section
      className="ws in-stage"
      data-compact={compact ? "" : undefined}
      aria-labelledby={id}
      style={word ? ({ "--letters": String(word.length) } as CSSProperties) : undefined}
    >
      {word && (
        <p className="in-word ws-word" aria-hidden="true" dir="ltr">
          {word}
        </p>
      )}
      <div className="ws-grid">
        <div className="ws-copy">
          <Breadcrumbs items={crumbs} label={t.common.breadcrumb} tone="night" />
          <h1 id={id}>{title}</h1>
          <p className="ws-lead">{lead}</p>
          {(primary || secondary) && (
            <div className="ws-actions">
              {primary &&
                (isValidElement(primary) ? primary : <StagePill href={primary.href}>{primary.label}</StagePill>)}
              {secondary && (
                <Link href={secondary.href} className="in-link">
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
          {fact && <p className="ws-fact in-mono">{fact}</p>}
        </div>
        {ticket && (
          <div className="ws-side">
            <Ticket title={ticket.title} titleAs="h2" rows={ticket.rows} className="ws-ticket" />
            {ticket.note && <p className="ws-note">{ticket.note}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
