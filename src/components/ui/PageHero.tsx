import { isValidElement, type ReactElement, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";

type Action = { href: string; label: string };
type Photo = { src: string; alt: string; width: number; height: number };

type Props = {
  /** `split`: copy beside AIMS's own photograph, holding the first screen alone on desktop. `compact`: no photo. */
  variant: "split" | "compact";
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  /** AIMS's English title on an Arabic page keeps lang="en" (CLAUDE.md §7). */
  titleLang?: "en";
  lead?: ReactNode;
  /** At most two actions (CLAUDE.md §2): a link, or a ready element when it does more than navigate. */
  primary?: Action | ReactElement;
  secondary?: Action | ReactElement;
  /** The first screen's one hard fact, under the actions (design-taste-frontend House rule 5). */
  fact?: ReactNode;
  photo?: Photo | null;
  /** A screen capture sits on a white panel; a cut-out product photograph stands on the page. */
  framed?: boolean;
  /** The h1's id, which names the hero's region; one hero per page. */
  id?: string;
};

/**
 * The one page hero (design-taste-frontend one system; Design Doc 9, 10). It enters once on load and then
 * stands (CLAUDE.md §3; taste motion.md "The hero's entrance"): `data-enter` marks it for the gate, and
 * `.hero-enter` (ui/sections.css) rises the copy in turn while the photograph settles; reduced motion rests.
 */
export async function PageHero(props: Props) {
  const { variant, crumbs, eyebrow, title, titleLang, lead, fact, photo, framed, id = "hero-title" } = props;
  const t = await getDictionary();
  const copy = (
    <div className="page-hero-copy">
      {eyebrow && <p className="page-hero-eyebrow hero-enter">{eyebrow}</p>}
      <h1 id={id} className="hero-enter" lang={titleLang} dir={titleLang ? "ltr" : undefined}>
        {title}
      </h1>
      {typeof lead === "string" ? (
        <p className="page-hero-lead hero-enter">{lead}</p>
      ) : (
        lead && <div className="page-hero-lead hero-enter">{lead}</div>
      )}
      {(props.primary || props.secondary) && (
        <div className="page-hero-actions hero-enter">
          {props.primary && renderAction(props.primary, "home-button")}
          {props.secondary && renderAction(props.secondary, "home-secondary")}
        </div>
      )}
      {fact && <p className="page-hero-fact hero-enter">{fact}</p>}
    </div>
  );
  return (
    <section className={`page-hero page-hero-${variant}`} aria-labelledby={id} data-enter>
      {/* One in-flow .wrap, the content line every section shares (layout-v4.md 2, SR-6). */}
      <div className="wrap">
        <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
        {variant === "compact" ? (
          copy
        ) : (
          <div className="page-hero-grid">
            {copy}
            {photo && (
              <div
                className={
                  framed ? "page-hero-media hero-enter-media page-hero-framed" : "page-hero-media hero-enter-media"
                }
              >
                {/* The LCP element on desktop: preloaded, sized, never shifts (CLAUDE.md §5). */}
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 30rem, 16rem"
                  preload
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function renderAction(action: Action | ReactElement, className: string) {
  if (isValidElement(action)) return action;
  return (
    <Link href={action.href} className={className}>
      {action.label}
      {className === "home-button" && <ArrowIcon width="18" height="18" className="home-action-arrow" />}
    </Link>
  );
}
