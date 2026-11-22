import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * Every URL no route claims lands here, so the 404 renders inside the site shell in the visitor's
 * language ([lang]/not-found.tsx) instead of the bare global page (audit T10). The page never reads
 * its params and throws before anything streams, so even the prerendered fallback shell answers with
 * a real 404 status (smoke.spec "unknown URLs return a real 404 page"). Redirects run before routing
 * and more specific routes always win over a catch-all, so neither is affected.
 */
export function generateStaticParams() {
  // Cache Components needs at least one param (docs: generate-static-params); this one is a 404 too.
  return [{ missing: ["page-not-found"] }];
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.notFound.title };
}

export default function MissingPage() {
  notFound();
}
