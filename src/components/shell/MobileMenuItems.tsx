import { ChevronDownIcon } from "@/components/icons";
import { NavigationLink as Link } from "./NavigationLink";
import type { NavItem } from "./DesktopNav";

type Props = { items: NavItem[]; externalLabel: string; onNavigate: () => void };

/** The mobile sheet's sections: plain links and <details> accordions (Design Doc 6). */
export function MobileMenuItems({ items, externalLabel, onNavigate }: Props) {
  return (
    <ul className="mt-4 divide-y divide-line border-y border-line">
      {items.map((item) =>
        item.kind === "link" ? (
          <li key={item.label}>
            <Link
              externalLabel={externalLabel}
              href={item.href}
              onClick={onNavigate}
              className="flex h-13 items-center text-base font-semibold"
            >
              {item.label}
            </Link>
          </li>
        ) : (
          <li key={item.label}>
            <details className="group">
              <summary className="flex h-13 cursor-pointer list-none items-center justify-between text-base font-semibold [&::-webkit-details-marker]:hidden">
                {item.label}
                <ChevronDownIcon className="text-ink-600 transition-transform duration-(--duration-base) ease-(--ease-aims) group-open:rotate-180" />
              </summary>
              {/* display flips none → block on open, which restarts .motion-disclose every time. */}
              <ul className="motion-disclose hidden pb-3 group-open:block">
                {item.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      externalLabel={externalLabel}
                      href={l.href}
                      onClick={onNavigate}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-sm px-2 text-menu text-ink-700 transition-colors duration-(--duration-hover) ease-(--ease-aims) hover:bg-paper-2"
                    >
                      {l.label}
                      {l.meta && <span className="text-xs text-ink-400 tabular-nums">{l.meta}</span>}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    externalLabel={externalLabel}
                    href={item.footer.href}
                    onClick={onNavigate}
                    className="flex min-h-11 items-center px-2 text-menu font-semibold text-green-700"
                  >
                    {item.footer.label}
                  </Link>
                </li>
              </ul>
            </details>
          </li>
        ),
      )}
    </ul>
  );
}
