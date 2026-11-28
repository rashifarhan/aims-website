"use client";

import { useEffect, useRef, useState } from "react";
import { ContactLink } from "@/components/contact/ContactLink";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import "./floating-contact.css";

type Line = { tel: string; display: string };
export type FloatingContactProps = { whatsappHref: string; line: Line; labels: Dictionary["floatingContact"] };

/** Bars pinned to the foot of the screen (quote tray, compare tray, the purchase and review bars) mark themselves. */
const BARS = "[data-bottom-bar]";
/** The home dive keeps the screen to itself: its own arrows and chips sit in the same corner. */
const CLEAR = "[data-dock-clear]";
/** A page that is all contact channels already (Contact) needs no second copy of them. */
const OFF = "[data-dock-off]";

const shown = (el: Element) => el.checkVisibility();
const onScreen = (el: Element) => {
  const box = el.getBoundingClientRect();
  return box.bottom > 0 && box.top < innerHeight;
};

/**
 * WhatsApp and Call in the corner, on every page (owner request, 28 Nov 2026, as on AIMS's own site), to the line
 * AIMS's site-wide chat uses (site.ts NEED_CHANNELS.sales). Design Doc 6: never in the first screen, so it comes in
 * once the visitor scrolls past it (on home, once the dive has played). It steps aside at the footer, which lists
 * every line, and while a form field has focus (a phone's keyboard needs the room). It rises above any bar pinned to
 * the foot, so the two never overlap. Both links go through ContactLink: in the preview they open the notice first.
 */
export function FloatingContact({ whatsappHref, line, labels }: FloatingContactProps) {
  const [on, setOn] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pick = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(shown);
        const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
        const footer = pick("footer").some(onScreen);
        const clear = pick(CLEAR).some(onScreen);
        const off = pick(OFF).length > 0;
        setOn(scrollY > innerHeight * 0.8 && !footer && !clear && !off && !editing);
        let lift = 0;
        for (const bar of pick(BARS)) {
          const box = bar.getBoundingClientRect();
          if (box.height > 0 && box.top < innerHeight && box.bottom > innerHeight - 32) {
            lift = Math.max(lift, innerHeight - box.top);
          }
        }
        dock.current?.style.setProperty("--fc-lift", `${Math.round(lift)}px`);
      });
    };
    update();
    // A tray or bar appearing, or a page swapped in by a client navigation, changes what the dock must clear.
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ["hidden", "data-on", "class", "aria-hidden"],
    });
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);
  return (
    <div ref={dock} className="fc" data-on={on || undefined} inert={!on} role="group" aria-label={labels.label}>
      <ContactLink kind="whatsapp" href={whatsappHref} target={line.display} className="fc-button fc-whatsapp">
        <WhatsAppIcon width="24" height="24" />
        <span className="sr-only">{labels.whatsapp}</span>
      </ContactLink>
      <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="fc-button fc-call">
        <PhoneIcon width="22" height="22" aria-hidden="true" />
        <span className="sr-only">{fmt(labels.call, { number: line.display })}</span>
      </ContactLink>
    </div>
  );
}
