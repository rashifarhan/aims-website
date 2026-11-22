"use client";

import { NavigationLink as Link } from "./NavigationLink";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowIcon, ChevronDownIcon } from "@/components/icons";

export type MenuLink = { href: string; label: string; summary?: string; meta?: string };
export type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "menu"; label: string; lead: string; links: MenuLink[]; footer: MenuLink };

/**
 * Desktop navigation with disclosure menus (button + panel, not ARIA menus:
 * they hold ordinary links). Click toggles; Esc, outside click, focus leaving
 * the nav and navigation close; focus returns to the button on Esc. Opening
 * leaves focus on the button (WAI-ARIA disclosure): the panel follows it in
 * DOM order, so Tab reaches the links next.
 */
export function DesktopNav({
  items,
  label,
  externalLabel,
}: {
  items: NavItem[];
  label: string;
  externalLabel: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  // Switching straight from one open menu to another skips the enter animation: the panel area is
  // already on screen, so a second settle would read as lag (README → Decisions, "Interaction layer").
  const [instant, setInstant] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      buttons.current[open]?.focus();
      setOpen(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const toggle = (i: number) => {
    setInstant(open !== null && open !== i);
    setOpen(open === i ? null : i);
  };

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className="hidden lg:block"
      onBlur={(e) => {
        // Keyboard focus leaving the whole nav closes the panel; a null relatedTarget (window blur,
        // click on a non-focusable area) is left to the outside-pointer handler.
        if (open !== null && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpen(null);
      }}
    >
      <ul className="flex items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label}>
            {item.kind === "link" ? (
              <Link
                externalLabel={externalLabel}
                href={item.href}
                className="nav-motion inline-flex h-11 items-center rounded-pill px-2 text-small font-medium text-ink-700 hover:bg-paper-2 hover:text-ink xl:px-3"
              >
                {item.label}
              </Link>
            ) : (
              <>
                <button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={`${baseId}-${i}`}
                  onClick={() => toggle(i)}
                  className="nav-motion inline-flex h-11 items-center gap-1 rounded-pill px-2 text-small font-medium text-ink-700 hover:bg-paper-2 hover:text-ink aria-expanded:bg-paper-2 aria-expanded:text-ink xl:px-3"
                >
                  {item.label}
                  <ChevronDownIcon
                    width={16}
                    height={16}
                    className={`transition-transform duration-(--duration-base) ease-(--ease-aims) ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  id={`${baseId}-${i}`}
                  hidden={open !== i}
                  data-instant={open === i && instant ? "" : undefined}
                  /* Enters from its @starting-style (fade + 6px settle) when `hidden` lifts; closes at
                     once because display: none is not transitioned. Reduced motion: motion-fade keeps
                     only the fade. */
                  className="motion-fade absolute inset-x-0 top-full border-b border-line bg-paper shadow-2 transition-[opacity,translate] duration-(--duration-dropdown) ease-(--ease-aims) data-instant:transition-none starting:-translate-y-1.5 starting:opacity-0"
                >
                  <div className="page-container grid grid-cols-[220px_1fr] gap-10 py-8">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-ink">{item.label}</p>
                      <p className="mt-2 text-sm text-ink-600">{item.lead}</p>
                      <Link
                        externalLabel={externalLabel}
                        href={item.footer.href}
                        onClick={() => setOpen(null)}
                        className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
                      >
                        {item.footer.label}
                        {item.footer.meta && <span className="font-normal text-ink-600">{item.footer.meta}</span>}
                        <ArrowIcon width={16} height={16} />
                      </Link>
                    </div>
                    <ul className="grid grid-cols-3 gap-2">
                      {item.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            externalLabel={externalLabel}
                            href={l.href}
                            onClick={() => setOpen(null)}
                            className="block h-full rounded-md border border-transparent p-3.5 transition-[color,background-color,border-color] duration-(--duration-hover) ease-[ease] hover:border-line hover:bg-paper-2"
                          >
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="font-semibold text-ink">{l.label}</span>
                              {l.meta && <span className="text-xs text-ink-400 tabular-nums">{l.meta}</span>}
                            </span>
                            {l.summary && <span className="mt-1 block text-sm text-ink-600">{l.summary}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
