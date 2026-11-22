import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getDictionary } from "@/i18n/dictionaries";
import type { Block } from "@/content/schema";
import { outline } from "@/lib/editorial";
import { EditorialBlocks } from "./EditorialBlocks";

type Props = {
  crumbs: Crumb[];
  title: string;
  /** `en` when the title is AIMS's English text on an Arabic page. */
  titleLang?: string;
  lead?: string;
  /** AIMS's text. Product and policy text is English; Arabic pages mark it `lang="en"`. */
  blocks?: Block[];
  blocksLang?: string;
  /** A short line under the lead, such as where the text comes from. */
  note?: string;
  /** Own sections placed after the text. */
  children?: ReactNode;
};

/**
 * T10 Editorial (Master Plan 14; Design Doc 10.1): one h1, a reading column of 680px, and an in-page
 * index, a list beside the text on desktop and a "Jump to" disclosure on a phone. Nothing sticks.
 */
export async function EditorialPage({
  crumbs,
  title,
  titleLang,
  lead,
  blocks = [],
  blocksLang,
  note,
  children,
}: Props) {
  const t = await getDictionary();
  const index = outline(blocks);
  const links = (
    <ol>
      {index.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  );
  return (
    <main id="main" className="ed page-container">
      <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
      <header className="ed-head">
        <h1 lang={titleLang}>{title}</h1>
        {lead && <p className="t3-promise">{lead}</p>}
        {note && <p className="ed-note">{note}</p>}
      </header>
      {blocks.length > 0 && (
        <div className="ed-body">
          {index.length > 2 && (
            <>
              <nav className="ed-index ed-index-wide" aria-label={t.editorial.onThisPage}>
                <p className="ed-index-title">{t.editorial.onThisPage}</p>
                {links}
              </nav>
              <details className="ed-index ed-index-narrow">
                <summary>{t.editorial.jump}</summary>
                {links}
              </details>
            </>
          )}
          <EditorialBlocks blocks={blocks} lang={blocksLang} />
        </div>
      )}
      {children}
    </main>
  );
}
