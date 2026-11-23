import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getDictionary } from "@/i18n/dictionaries";

type Props = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  /** AIMS's English title on an Arabic page keeps lang="en" (CLAUDE.md §7). */
  titleLang?: "en";
  lead?: ReactNode;
  children?: ReactNode;
};

/**
 * T10 intro (Design Doc 10.1): breadcrumb, title and lead, compact so the reading starts in the first
 * screen. It enters once on load like the T3 hero (editorial.css .ed-enter) and then stands.
 */
export async function EditorialIntro({ crumbs, eyebrow, title, titleLang, lead, children }: Props) {
  const t = await getDictionary();
  return (
    <div className="ed-intro page-container">
      <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
      <div>
        {eyebrow && <p className="ed-eyebrow ed-enter">{eyebrow}</p>}
        <h1 className="ed-enter" lang={titleLang} dir={titleLang ? "ltr" : undefined}>
          {title}
        </h1>
        {lead && <div className="ed-lead ed-enter">{lead}</div>}
        {children && <div className="ed-enter">{children}</div>}
      </div>
    </div>
  );
}
