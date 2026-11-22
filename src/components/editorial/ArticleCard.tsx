import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/content/pages";

type Props = { article: Article; href: string; dateLabel: string };

/**
 * One blog article on the index (Design Doc 9: one card style). The heading is the card's one
 * link, stretched over the card, so the card is a single tab stop; the photo zooms on hover.
 */
export function ArticleCard({ article, href, dateLabel }: Props) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-paper transition-transform duration-(--duration-fast) hover:-translate-y-0.5">
      {article.image && (
        <div className="aspect-[16/9] overflow-hidden bg-paper-2">
          <Image
            src={article.image.src}
            alt=""
            width={article.image.width}
            height={article.image.height}
            sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-(--duration-slow) group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div lang="en" dir="ltr" className="flex flex-1 flex-col gap-2 p-5">
        {article.date && (
          <p className="text-sm text-ink-600 tabular-nums">
            <span className="sr-only">{dateLabel} </span>
            <time dateTime={article.date}>{article.date}</time>
          </p>
        )}
        <h2 className="text-lg leading-snug font-semibold text-ink">
          <Link href={href} className="after:absolute after:inset-0 hover:underline">
            {article.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-ink-700">{article.excerpt}</p>
      </div>
    </article>
  );
}
