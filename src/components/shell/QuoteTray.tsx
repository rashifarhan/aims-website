"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowIcon, ListIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { countLabel } from "@/i18n/format";
import { useQuote } from "@/lib/quote/useQuote";
import "./quote-tray.css";

type Props = { href: string; labels: Dictionary["quoteTray"] };

/**
 * The quote tray (client request, 25 Nov 2026, product and buyer-psychology review): once the quote list holds
 * anything, a slim night bar pinned to the bottom of every page that can add to it says what is in the list, that
 * it is not sent yet, and what to do next. The header badge sits outside where the eye is when a model is added,
 * and "In quote" alone can read as "requested". It shows only on pages with an add-to-quote control on screen
 * (`[data-quote-add]`), not on the quote page, steps aside while the footer is on screen, and never times out (WCAG 2.2.1). Not a live
 * region: each add-to-quote control already announces its own change.
 */
export function QuoteTray({ href, labels }: Props) {
  const { lines } = useQuote();
  const [atFooter, setAtFooter] = useState(false);
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setAtFooter(entry?.isIntersecting ?? false));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  // Which page is on screen decides, so the check reads what is visible: Next keeps a page left behind in the DOM,
  // hidden, after a client navigation, and its add-to-quote controls must not count.
  useEffect(() => {
    const narrow = matchMedia("(width < 64rem)");
    const shown = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).some((el) => el.checkVisibility());
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setEligible(
          shown("[data-quote-add]") &&
            !shown("[data-quote-page]") &&
            // The product page's own bar holds the quantity and the add on phones and tablets.
            !(narrow.matches && shown("[data-purchase-bar]")),
        ),
      );
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributeFilter: ["style", "hidden"] });
    narrow.addEventListener("change", check);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      narrow.removeEventListener("change", check);
    };
  }, []);
  const units = lines.reduce((sum, line) => sum + line.qty, 0);
  const on = lines.length > 0 && eligible && !atFooter;
  // Keyboard focus is never hidden under the tray (WCAG 2.4.11): scrolling to a focused control leaves its height.
  useEffect(() => {
    document.documentElement.style.scrollPaddingBlockEnd = on ? "6rem" : "";
  }, [on]);
  return (
    <aside className="quote-tray" data-bottom-bar data-on={on || undefined} hidden={!on} aria-label={labels.label}>
      <span className="quote-tray-icon" aria-hidden="true">
        <ListIcon width={18} height={18} />
      </span>
      <p className="quote-tray-copy">
        <span className="quote-tray-title">{labels.label}</span>
        <span className="quote-tray-meta tabular-nums">
          <span>
            {countLabel(lines.length, labels.itemOne, labels.itemMany)}
            <span className="quote-tray-units"> · {countLabel(units, labels.unitOne, labels.unitMany)}</span>
          </span>
          <span className="quote-tray-sent">
            <span className="quote-tray-sep"> · </span>
            {labels.notSent}
          </span>
        </span>
      </p>
      <Link href={href} className="home-button home-button-sm quote-tray-action">
        {labels.action}
        <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
      </Link>
    </aside>
  );
}
