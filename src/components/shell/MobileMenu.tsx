"use client";

import { NavigationLink as Link } from "./NavigationLink";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { HeaderSearch } from "./HeaderSearch";
import { LanguageSwitch } from "./LanguageSwitch";
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
        className="grid size-11 place-items-center rounded-md border border-line text-ink lg:hidden"
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
        className="ms-auto me-0 h-dvh max-h-none w-[min(100vw,420px)] max-w-none bg-paper p-0 text-ink opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-(--duration-slow) ease-(--ease-aims) not-open:translate-x-8 backdrop:bg-ink/40 backdrop:opacity-0 backdrop:transition-opacity open:opacity-100 open:backdrop:opacity-100 rtl:not-open:-translate-x-8 starting:open:translate-x-8 starting:open:opacity-0 starting:open:backdrop:opacity-0 rtl:starting:open:-translate-x-8"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-15 items-center justify-between border-b border-line px-4">
            <span dir="ltr" className="text-lg font-extrabold tracking-wordmark">
              AIMS
              <svg
                viewBox="0 0 6 6"
                className="ms-px inline-block size-[0.24em] fill-lime"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="3" cy="3" r="3" />
              </svg>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="grid size-11 place-items-center rounded-md border border-line"
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

            <ul className="mt-4 divide-y divide-line border-y border-line">
              {items.map((item) =>
                item.kind === "link" ? (
                  <li key={item.label}>
                    <Link
                      externalLabel={labels.external}
                      href={item.href}
                      onClick={close}
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
                        <ChevronDownIcon className="text-ink-600 transition-transform group-open:rotate-180" />
                      </summary>
                      <ul className="pb-3">
                        {item.links.map((l) => (
                          <li key={l.href}>
                            <Link
                              externalLabel={labels.external}
                              href={l.href}
                              onClick={close}
                              className="flex min-h-11 items-center justify-between gap-3 rounded-sm px-2 text-menu text-ink-700 hover:bg-paper-2"
                            >
                              {l.label}
                              {l.meta && <span className="text-xs text-ink-400 tabular-nums">{l.meta}</span>}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            externalLabel={labels.external}
                            href={item.footer.href}
                            onClick={close}
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
          </div>

          <div className="grid gap-2 border-t border-line p-4">
            <Link
              externalLabel={labels.external}
              href={hrefs.quote}
              onClick={close}
              className="flex h-12 items-center justify-center rounded-pill bg-green-700 font-semibold text-white hover:bg-green-800"
            >
              {labels.quote}
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <ContactLink
                kind="whatsapp"
                href={hrefs.whatsapp}
                target={hrefs.whatsappDisplay}
                className="flex h-12 items-center justify-center gap-2 rounded-pill bg-whatsapp font-semibold text-white"
              >
                <WhatsAppIcon width={18} height={18} />
                {labels.whatsapp}
              </ContactLink>
              <ContactLink
                kind="phone"
                href={`tel:${hrefs.tel}`}
                target={hrefs.telDisplay}
                className="flex h-12 items-center justify-center gap-2 rounded-pill border border-ink font-semibold"
              >
                <PhoneIcon width={18} height={18} />
                {labels.call}
              </ContactLink>
            </div>
            <LanguageSwitch
              target={otherLocale}
              label={labels.language}
              className="mt-1 flex h-11 items-center justify-center text-sm font-semibold text-ink-700"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
