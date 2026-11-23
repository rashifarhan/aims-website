"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { HeaderSearch } from "./HeaderSearch";
import { MobileMenuActions } from "./MobileMenuActions";
import { MobileMenuItems } from "./MobileMenuItems";
import type { NavItem } from "./DesktopNav";
import type { Locale } from "@/i18n/config";

import type { SearchEntry } from "@/lib/searchSuggestions";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  searchEntries: SearchEntry[];
  searchLabels: Dictionary["search"];
  items: NavItem[];
  labels: {
    external: string;
    open: string;
    close: string;
    menu: string;
    search: string;
    searchSubmit: string;
    quote: string;
    whatsapp: string;
    call: string;
    language: string;
  };
  hrefs: { search: string; quote: string; whatsapp: string; whatsappDisplay: string; tel: string; telDisplay: string };
  otherLocale: Locale;
};

/**
 * Mobile menu sheet (Design Doc ch. 6): a modal <dialog> from the inline
 * end, so focus trapping, Esc and an inert page come from the platform.
 * Search first, sections as <details> accordions, then Quote, WhatsApp
 * and Call, language last.
 */
export function MobileMenu({ items, labels, hrefs, otherLocale, searchEntries, searchLabels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const dialogId = useId();
  const [expanded, setExpanded] = useState(false);

  // Close when navigation happens inside the sheet.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const close = () => dialog.current?.close();

  return (
    <>
      <button
        ref={toggle}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-controls={dialogId}
        aria-label={labels.open}
        onClick={() => {
          dialog.current?.showModal();
          setExpanded(true);
        }}
        className="home-button home-button-outline home-button-icon lg:hidden"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialog}
        id={dialogId}
        aria-label={labels.menu}
        onClick={(e) => e.target === dialog.current && close()}
        onClose={() => {
          setExpanded(false);
          toggle.current?.focus();
        }}
        // A sheet attached to the inline-end edge slides fully in from that edge (Design Doc 8);
        // the open state carries the enter timing, the closed state the faster exit. Opacity stays in
        // the transition so .motion-fade can keep a fade alone under reduced motion. The sheet is
        // fixed in the top layer, so the off-screen translate adds no page scroll.
        className="motion-fade ms-auto me-0 h-dvh max-h-none w-[min(100vw,420px)] max-w-none bg-paper p-0 text-ink opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-(--duration-drawer-exit) ease-(--ease-aims) not-open:translate-x-full backdrop:bg-ink/40 backdrop:opacity-0 backdrop:transition-opacity backdrop:duration-(--duration-drawer-exit) backdrop:ease-(--ease-aims) open:opacity-100 open:duration-(--duration-drawer) open:ease-(--ease-drawer) open:backdrop:opacity-100 open:backdrop:duration-(--duration-drawer) open:backdrop:ease-(--ease-drawer) rtl:not-open:-translate-x-full starting:open:translate-x-full starting:open:opacity-0 starting:open:backdrop:opacity-0 rtl:starting:open:-translate-x-full"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-15 items-center justify-between border-b border-line px-4">
            <span dir="ltr" className="text-lg font-extrabold tracking-wordmark">
              AIMS<span className="text-lime">.</span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="home-button home-button-outline home-button-icon"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <HeaderSearch
              entries={searchEntries}
              labels={searchLabels}
              id="mobile-search"
              action={hrefs.search}
              placeholder={labels.search}
              submitLabel={labels.searchSubmit}
            />

            <MobileMenuItems items={items} externalLabel={labels.external} onNavigate={close} />
          </div>

          <MobileMenuActions labels={labels} hrefs={hrefs} otherLocale={otherLocale} onNavigate={close} />
        </div>
      </dialog>
    </>
  );
}
