import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { productBySlug } from "@/content/catalogue";
import { getDictionary } from "@/i18n/dictionaries";

type Action = { href: string; label: string };
type Props = {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  lead: string;
  primary: Action;
  secondary: Action;
  photo: string;
};

/**
 * The T3 hero for the company pages (Master Plan 14; solution.css): title, promise and two actions
 * beside one of AIMS's own product photographs, holding the first screen alone on desktop. It enters
 * once on load like the solution hero (.t3-enter) and then stands.
 */
export async function CompanyIntro({ crumbs, eyebrow, title, lead, primary, secondary, photo }: Props) {
  const t = await getDictionary();
  const image = productBySlug(photo)?.images[0];
  return (
    <div className="t3-intro page-container">
      <Breadcrumbs label={t.common.breadcrumb} items={crumbs} />
      <div className="t3-hero">
        <div className="t3-hero-copy">
          <p className="t3-eyebrow t3-enter">{eyebrow}</p>
          <h1 className="t3-enter">{title}</h1>
          <p className="t3-promise t3-enter">{lead}</p>
          <div className="t3-actions t3-enter">
            <Link href={primary.href} className="home-button">
              {primary.label}
              <ArrowIcon width="18" height="18" className="home-action-arrow" />
            </Link>
            <Link href={secondary.href} className="home-secondary">
              {secondary.label}
            </Link>
          </div>
        </div>
        {image && (
          <div className="t3-hero-photo">
            {/* The LCP element on desktop: preloaded, sized, never shifts (CLAUDE.md §5). */}
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 30rem, 16rem"
              preload
            />
          </div>
        )}
      </div>
    </div>
  );
}
