import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { DescribeItem } from "./DescribeItem";

/**
 * An empty list with no installation or export preset: browsing is the main way forward, describing an
 * unlisted item the second (Design Doc 11, empty state). A preset need skips this and opens the form.
 */
export function EmptyQuote({ t, productsHref }: { t: Dictionary["quote"]; productsHref: string }) {
  return (
    <div className="mt-8 rounded-lg border border-line bg-paper-2 p-6 sm:p-8">
      <p className="text-lg font-semibold text-ink">{t.empty}</p>
      <Link href={productsHref} className="home-button mt-4">
        {t.browse}
      </Link>
      <div className="mt-6 border-t border-line pt-2">
        <DescribeItem t={t} productsHref={productsHref} />
      </div>
    </div>
  );
}
