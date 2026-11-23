import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { articleSolution } from "@/lib/editorial";
import { solutionPath } from "@/lib/nav";

/**
 * The article's way forward (Master Plan 12 #13–14: "Read → solution; links into products"): the
 * solution its slug names as a linked card, and one quote action. A slug that names no trade leads to
 * the solutions hub instead.
 */
export async function ArticleNext({ slug }: { slug: string }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.blog;
  const solution = articleSolution(slug);
  const target = solution
    ? { href: solutionPath(solution), name: t.solutions[solution].name, summary: t.solutions[solution].summary }
    : { href: "/solutions", name: c.hub, summary: c.hubSummary };
  return (
    <section className="ed-next" aria-labelledby="article-next-title">
      <h2 id="article-next-title" className="ed-next-title">
        {c.nextHeading}
      </h2>
      <p className="ed-next-body">{c.nextBody}</p>
      <div className="ed-next-actions">
        <div className="ed-next-card ui-card ui-card-interactive">
          <p className="ed-next-label">{c.solutionLabel}</p>
          <Link href={localePath(locale, target.href)} className="ed-next-link">
            {target.name}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
          <p className="ed-next-summary">{target.summary}</p>
        </div>
        <Link href={localePath(locale, "/quote")} className="home-button">
          {c.quote}
          <ArrowIcon width="18" height="18" className="home-action-arrow" />
        </Link>
      </div>
    </section>
  );
}
