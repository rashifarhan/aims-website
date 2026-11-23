"use client";

import { FacetPanel, type FacetGroupView } from "./FacetPanel";

type Props = {
  groups: FacetGroupView[];
  onToggle: (groupId: string, value: string) => void;
  label: string;
  /** A compare tray is showing at the foot of the screen. */
  trayOpen: boolean;
};

/**
 * The desktop facet rail (Design Doc 10, T4: 232px). It stays beside a long grid and scrolls on its own when
 * taller than the screen; it stops above the compare tray when one is shown (WCAG 2.4.11).
 */
export function FacetRail({ groups, onToggle, label, trayOpen }: Props) {
  return (
    <aside
      aria-label={label}
      className={`hidden overscroll-contain lg:sticky lg:top-20 lg:-ms-1 lg:block lg:self-start lg:overflow-y-auto lg:py-1 lg:ps-1 lg:pe-2 ${trayOpen ? "lg:max-h-[calc(100dvh-12rem)]" : "lg:max-h-[calc(100dvh-6.5rem)]"}`}
    >
      <h2 className="sr-only">{label}</h2>
      <FacetPanel groups={groups} onToggle={onToggle} idPrefix="rail" />
    </aside>
  );
}
