"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowIcon, ChevronDownIcon } from "@/components/icons";

export type MenuLink = { href: string; label: string; summary?: string; meta?: string };
export type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "menu"; label: string; lead: string; links: MenuLink[]; footer: MenuLink };

/**
 * Desktop navigation with disclosure menus (button + panel, not ARIA menus:
 * they hold ordinary links). Click toggles; Esc, outside click and
 * navigation close; focus returns to the button on Esc.
 */
export function DesktopNav({ items, label }: { items: NavItem[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
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

  return (
    <nav ref={navRef} aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label}>
            {item.kind === "link" ? (
              <Link
                href={item.href}
                className="inline-flex h-10 items-center rounded-pill px-3 text-small font-medium text-ink-700 transition-colors hover:bg-paper-2 hover:text-ink"
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
                  onClick={() => setOpen(open === i ? null : i)}
                  className="inline-flex h-10 items-center gap-1 rounded-pill px-3 text-small font-medium text-ink-700 transition-colors hover:bg-paper-2 hover:text-ink aria-expanded:bg-paper-2 aria-expanded:text-ink"
                >
                  {item.label}
                  <ChevronDownIcon
                    width={16}
                    height={16}
                    className={`transition-transform duration-(--duration-base) ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  id={`${baseId}-${i}`}
                  hidden={open !== i}
                  className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-2"
                >
                  <div className="mx-auto grid max-w-(--container-page) grid-cols-[220px_1fr] gap-10 px-6 py-8">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-ink">{item.label}</p>
                      <p className="mt-2 text-sm text-ink-600">{item.lead}</p>
                      <Link
                        href={item.footer.href}
                        onClick={() => setOpen(null)}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
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
                            href={l.href}
                            onClick={() => setOpen(null)}
                            className="block h-full rounded-md border border-transparent p-3.5 transition-colors hover:border-line hover:bg-paper-2"
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
