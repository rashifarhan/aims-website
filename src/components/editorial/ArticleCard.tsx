import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/content/pages";
import { articleDate } from "@/lib/editorial";

type Props = { article: Article; href: string; heading?: "h2" | "h3" };

/**
 * One AIMS article as the shared card (ui/actions.css .ui-card; Design Doc 9: one card style). The title
 * is the card's one link, stretched over it, so the card is a single tab stop; the card lifts and the
 * photo zooms on hover. The image is AIMS's own, saved by the importer; it is decorative here because the
 * title says the same. The card is the article's own English text, so its date is written in English too.
 */
export function ArticleCard({ article, href, heading: Heading = "h2" }: Props) {
  return (
    <article className="ed-card ui-card ui-card-interactive">
      {article.image && (
        <div className="ed-card-photo ui-card-photo">
          <Image
            src={article.image.src}
            alt=""
            width={article.image.width}
            height={article.image.height}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="ed-card-body" lang="en" dir="ltr">
        <Heading>
          <Link href={href}>{article.title}</Link>
        </Heading>
        <p className="ed-card-excerpt">{article.excerpt}</p>
        {article.date && (
          <p className="ed-card-date tabular-nums">
            <time dateTime={article.date}>{articleDate(article.date, "en")}</time>
          </p>
        )}
      </div>
    </article>
  );
}
