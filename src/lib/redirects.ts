/**
 * 301 map from aimsuae.me URLs to the new routes (Master Plan ch. 12, AT-13).
 * Product, software and location URLs are unchanged and are not listed.
 * Consumed by next.config.ts and tested in redirects.test.ts.
 */
import products from "../../content/products.json";
import { OLD_CATEGORIES, SWCATEGORY_TO_TYPE, categoryRedirectTarget } from "../content/taxonomy";

/** 301 (not Next's default 308) to match the plan and legacy clients. */
export type Redirect = { source: string; destination: string; statusCode: 301 };

const r = (source: string, destination: string): Redirect => ({ source, destination, statusCode: 301 });

export function buildRedirects(): Redirect[] {
  return [
    // Consolidated pages
    r("/product", "/products"),
    r("/enquiry", "/contact"),
    r("/contact.html", "/contact"),
    r("/index.html", "/"),
    r("/getaquote", "/quote"),
    // ZKAccess 3.5 is retired; its successor for AIMS is ZKBio CVAccess (client, 26 Nov 2026).
    r("/software/zkaccess-3-5", "/software/zkbio-cvaccess"),
    r("/ar/software/zkaccess-3-5", "/ar/software/zkbio-cvaccess"),
    // The Dubai page's other-language aliases go straight to its pair, so it never exists twice (Plan 12 #32, #35).
    r("/zkteco-dubai", "/zkteco-distributor-in-dubai"),
    r("/ar/zkteco-distributor-in-dubai", "/ar/zkteco-dubai"),
    r("/faq", "/support#faq"),
    r("/zkteco-warranty-policy", "/support#warranty"),

    // 16 overlapping categories → 6 families (or a filtered view)
    ...OLD_CATEGORIES.map((slug) => r(`/category/${slug}`, categoryRedirectTarget(slug))),

    // Software categories → Download Centre filter
    ...Object.entries(SWCATEGORY_TO_TYPE).map(([slug, type]) =>
      r(`/swcategory/${slug}`, type ? `/software?type=${type}` : "/software"),
    ),

    // The same product published twice (detected by the content import)
    ...(products as { slug: string; duplicateOf?: string }[])
      .filter((p) => p.duplicateOf)
      .map((p) => r(`/product/${p.slug}`, `/product/${p.duplicateOf}`)),

    // Dead blog URLs listed in the current sitemap → closest live page
    r("/blog/biotime-cloud", "/software/biotimecloud"),
    r("/blog/cash-back-season-at-zktecoaims-", "/blog"),
    r("/blog/d3180", "/product/zk-d3180s"),
    r("/blog/entrance-control", "/solutions/entrance-parking"),
    r("/blog/horus-e1", "/product/horus-e1-portable"),
    r("/blog/notus", "/products/entrance-control"),
    r("/blog/zk-teco--abu-dhabi", "/locations"),
    r("/blog/zkteco--mars", "/products/entrance-control"),
    r("/blog/zkteco--pos-point-of-sales", "/solutions/pos"),
    r("/blog/zkteco--proface-x", "/product/proface-x"),
  ];
}
