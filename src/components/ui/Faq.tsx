import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";

type Item = { q: string; a: ReactNode };

/**
 * The one FAQ on the site (design-taste-frontend one system; Design Doc 9): native disclosures, so
 * answers stay in the DOM for search and work by keyboard without ARIA (CLAUDE.md §4). A string answer
 * is a paragraph; structured answers (support's published blocks) arrive as nodes. With `intro`, the
 * heading column stands beside the list on desktop. The answer reveal lives in ui/sections.css.
 */
export function Faq({
  items,
  intro,
  lang,
  dir,
}: {
  items: readonly Item[];
  intro?: ReactNode;
  /** Support's answers are AIMS's published English, kept LTR on /ar (CLAUDE.md §7). */
  lang?: string;
  dir?: "ltr" | "rtl";
}) {
  const list = (
    <div className="ui-faq" lang={lang} dir={dir}>
      {items.map((item) => (
        <details key={item.q}>
          <summary>
            {item.q}
            <ChevronDownIcon />
          </summary>
          <div className="ui-faq-answer">{typeof item.a === "string" ? <p>{item.a}</p> : item.a}</div>
        </details>
      ))}
    </div>
  );
  if (!intro) return list;
  return (
    <div className="ui-faq-split">
      <div className="ui-faq-intro">{intro}</div>
      {list}
    </div>
  );
}
