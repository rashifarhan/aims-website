import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * The short head of a page whose job is choosing (the products hub and families, Solutions, Software): crumbs, the
 * H1 and one line on the stage ground, then the choices themselves on the first screen. No stage and no dive on
 * these pages (client decision, 28 Nov 2026): a visitor who came to pick should not have to get past a showpiece.
 */
export async function PageHead({
  crumbs,
  title,
  lead,
  action,
}: {
  crumbs: Crumb[];
  title: string;
  lead: string;
  action?: { href: string; label: string };
}) {
  const t = await getDictionary();
  return (
    <div className="page-head in-stage">
      <div className="wrap page-head-inner">
        <div className="page-head-copy">
          <Breadcrumbs items={crumbs} label={t.common.breadcrumb} tone="night" />
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
        {action && (
          <Link href={action.href} className="in-link" prefetch={false}>
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
