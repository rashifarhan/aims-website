import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Product } from "@/content/schema";
import { cutoutFor } from "@/content/cutouts";
import { KitArrow } from "./KitArrow";

type Props = {
  /** The page's own path, e.g. "/solutions/access-control". */
  path: string;
  crumb: string;
  title: string;
  lead: string;
  product: Product;
  alt: string;
  secondary: { href: string; label: string };
};

/**
 * T3 row 1 (Master Plan 14) as the dealt `product` hero (skill layout-v4.md, hero-product): the
 * h1 and the lead with its hard fact in one head row, the two actions, and one AIMS product
 * photograph whole on the page's own ground (a cut-out: no box). It enters once on load
 * (data-enter); the h1 enters whole, so React keeps its text node (motion.js, data-enter-whole).
 */
export async function T3Hero({ path, crumb, title, lead, product, alt, secondary }: Props) {
  const t = await getDictionary();
  const locale = await getLocale();
  const href = (p: string) => localePath(locale, p);
  const image = cutoutFor(product);
  return (
    <section className="hero hero--product" data-enter aria-labelledby="hero-h">
      <div className="wrap">
        <div className="hero-text hero__in">
          <Breadcrumbs
            label={t.common.breadcrumb}
            items={[
              { href: href("/"), label: t.common.home },
              { href: href("/solutions"), label: t.nav.solutions },
              { href: href(path), label: crumb },
            ]}
          />
          <div className="hero__head">
            <div>
              <h1 id="hero-h" data-enter-whole="">
                {title}
              </h1>
              <p className="hero__lead">{lead}</p>
            </div>
            <div className="btn-row">
              {/* The quote opens with the installation need preset (Design Doc 12). */}
              <Link href={href("/quote?need=install")} className="btn btn--primary">
                {t.nav.primaryAction}
                <KitArrow />
              </Link>
              <Link href={secondary.href} className="btn btn--secondary">
                {secondary.label}
              </Link>
            </div>
          </div>
          {image && (
            <div className="hero__stage">
              <Image
                src={image.src}
                alt={alt}
                fill
                priority
                sizes="(min-width: 1024px) 720px, 92vw"
                className="is-cutout"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
