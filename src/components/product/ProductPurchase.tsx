"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ContactLink } from "@/components/contact/ContactLink";
import { WhatsAppIcon } from "@/components/icons";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { fmt } from "@/i18n/format";
import { MAX_QTY } from "@/lib/quote/store";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";
import { CONTACT, whatsappUrl } from "@/lib/site";

type Labels = {
  add: string;
  inQuote: string;
  addedAnnounce: string;
  qtyAnnounce: string;
  qty: string;
  decrease: string;
  increase: string;
  viewQuote: string;
  askWhatsapp: string;
};

type Props = { slug: string; name: string; model: string; whatsappMessage: string; quoteHref: string; labels: Labels };

/**
 * Product page actions: qty + "Add to quote" + WhatsApp (Design Doc 10,
 * T5). On mobile a sticky bar with the same controls appears once the
 * inline ones have scrolled above the viewport; both share one quantity.
 */
export function ProductPurchase({ slug, name, model, whatsappMessage, quoteHref, labels }: Props) {
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("");
  const line = useQuote().lines.find((l) => l.kind === "product" && l.slug === slug);
  const inline = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    // Position check rather than IntersectionObserver: a fast fling or jump
    // can skip past the actions without ever "intersecting" them.
    let frame = 0;
    const check = () => {
      frame = 0;
      const el = inline.current;
      if (el) setShowBar(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const add = () => {
    dispatchQuote({ type: "add", slug, qty });
    // Adding again raises the line's quantity (store reducer); say the new total, so a repeat add is
    // never silent and never repeats the previous announcement word for word (audit T2).
    setStatus(
      line
        ? fmt(labels.qtyAnnounce, { name, qty: Math.min(MAX_QTY, line.qty + qty) })
        : fmt(labels.addedAnnounce, { name, qty }),
    );
  };

  const stepper = (
    <QtyStepper
      value={qty}
      onChange={setQty}
      label={labels.qty}
      decreaseLabel={labels.decrease}
      increaseLabel={labels.increase}
      size="lg"
    />
  );
  const addButton = (
    <button type="button" onClick={add} className="home-button flex-1 sm:flex-none">
      {labels.add}
    </button>
  );

  return (
    <>
      <div ref={inline} className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          {stepper}
          {addButton}
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl(whatsappMessage)}
            target={CONTACT.lines.mobile.display}
            message={whatsappMessage}
            className="home-button home-button-outline home-button-whatsapp"
          >
            <WhatsAppIcon width={18} height={18} />
            {labels.askWhatsapp}
          </ContactLink>
        </div>
        <p role="status" className="mt-3 min-h-6 text-sm text-ink-700">
          {line && (
            <>
              <span className="font-semibold text-green-700">
                <span aria-hidden="true">✓</span> {labels.inQuote} ·{" "}
                <span className="font-mono" dir="ltr">
                  {model}
                </span>{" "}
                × <span className="tabular-nums">{line.qty}</span>
              </span>{" "}
              <Link href={quoteHref} className="ui-link">
                {labels.viewQuote}
              </Link>
            </>
          )}
          <span className="sr-only">{status}</span>
        </p>
      </div>

      {/* Mobile sticky bar (Design Doc 6) */}
      <div
        aria-hidden={!showBar}
        inert={!showBar}
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/96 py-3 shadow-3 backdrop-blur-md transition-transform duration-(--duration-base) ease-(--ease-aims) lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="wrap flex items-center gap-3">
          {stepper}
          {addButton}
        </div>
      </div>
    </>
  );
}
