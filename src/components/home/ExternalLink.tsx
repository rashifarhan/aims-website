import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"a">, "title"> & { label: string };

/**
 * A link that leaves the preview for the live AIMS site or a map. The ↗ mark follows
 * Design Doc 9 ("View on current site ↗") and keeps the destination visible without a
 * second line of text under every action; screen readers hear the full destination.
 */
export function ExternalLink({ label, children, ...props }: Props) {
  return (
    <a {...props} title={label}>
      {children}
      <span aria-hidden="true" className="home-external-mark">
        ↗
      </span>
      <span className="sr-only"> · {label}</span>
    </a>
  );
}
