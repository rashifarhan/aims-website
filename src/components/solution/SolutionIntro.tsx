import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { productsInFamily } from "@/content/catalogue";

/** T3 row 1: title, promise and two actions (Master Plan 14). */
export async function SolutionIntro() {
  const t = await getDictionary();
  const c = t.solutionTimeAttendance;
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  return (
    <div className="t3-intro page-container">
      <Breadcrumbs
        label={t.common.breadcrumb}
        items={[
          { href: href("/"), label: t.common.home },
          { href: href("/solutions"), label: t.nav.solutions },
          { href: href("/solutions/time-attendance"), label: t.solutions["time-attendance"].name },
        ]}
      />
      <p className="t3-eyebrow">{c.eyebrow}</p>
      <h1>{c.title}</h1>
      <p className="t3-promise">{c.lead}</p>
      <div className="t3-actions">
        <Link href={href("/quote?need=install")} className="home-button">
          {c.primary}
          <ArrowIcon width="18" height="18" className="home-action-arrow" />
        </Link>
        <Link href={href("/products/time-attendance")} className="home-secondary">
          {fmt(c.secondary, { count: productsInFamily("time-attendance").length })}
        </Link>
      </div>
    </div>
  );
}
