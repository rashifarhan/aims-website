import Link from "next/link";
import type { FamilySlug } from "@/content/taxonomy";

export type FamilyTab = { slug: FamilySlug | null; label: string; count: number; href: string };

type Props = {
  label: string;
  tabs: FamilyTab[];
  /** The family in front: the filter (a URL value) or the page's own family. */
  active: string | null;
  /** On /products a tab filters the list in place; on a family page each tab is that family's own page. */
  onPick?: (slug: FamilySlug | null) => void;
};

/**
 * The families as one row of tabs above the list (client decision, 27 Nov 2026: pick a major category and see its
 * products at once). Toggle buttons (`aria-pressed`) where they filter in place, links with `aria-current` where they
 * open a family page. The row scrolls inside itself on a phone; the page never scrolls sideways.
 */
export function FamilyTabs({ label, tabs, active, onPick }: Props) {
  // Filters are a group of toggles; links to the family pages are navigation.
  const Box = onPick ? "div" : "nav";
  return (
    <Box aria-label={label} role={onPick ? "group" : undefined} className="family-tabs">
      <ul>
        {tabs.map((tab) => {
          const on = tab.slug === active;
          const body = (
            <>
              {tab.label}
              <span className="family-tabs-count">{tab.count}</span>
            </>
          );
          return (
            <li key={tab.slug ?? "all"}>
              {onPick ? (
                <button type="button" aria-pressed={on} onClick={() => onPick(tab.slug)}>
                  {body}
                </button>
              ) : (
                <Link href={tab.href} aria-current={on ? "page" : undefined} data-jump="">
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Box>
  );
}
