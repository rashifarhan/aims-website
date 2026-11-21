"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { fmt } from "@/i18n/format";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";

type Labels = {
  add: string;
  inQuote: string;
  addedAnnounce: string;
  qty: string;
  decrease: string;
  increase: string;
  viewQuote: string;
  askWhatsapp: string;
};

type Props = { slug: string; name: string; model: string; whatsappHref: string; quoteHref: string; labels: Labels };

/**
 * Product page actions: qty + "Add to quote" + WhatsApp (Design Doc 10,
 * T5). On mobile a sticky bar with the same controls appears once the
 * inline ones have scrolled above the viewport; both share one quantity.
 */
export function ProductPurchase({ slug, name, model, whatsappHref, quoteHref, labels }: Props) {
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
    setStatus(fmt(labels.addedAnnounce, { name, qty }));
  };

  const stepper = (
    <QtyStepper
      value={qty}
      onChange={setQty}
      label={labels.qty}
      decreaseLabel={labels.decrease}
      increaseLabel={labels.increase}
    />
  );
  const addButton = (
    <button
      type="button"
      onClick={add}
      className="inline-flex h-11 flex-1 items-center justify-center rounded-pill bg-green-700 px-6 font-semibold text-white transition-colors duration-(--duration-fast) hover:bg-green-800 sm:flex-none"
    >
      {labels.add}
    </button>
  );

  return (
    <>
      <div ref={inline} className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          {stepper}
          {addButton}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong px-4 text-sm font-semibold text-ink hover:border-ink"
          >
            <WhatsAppIcon width={18} height={18} className="text-whatsapp" />
            {labels.askWhatsapp}
          </a>
        </div>
        <p role="status" className="mt-3 min-h-6 text-sm text-ink-700">
          {line && (
            <>
              <span className="font-semibold text-green-700">
                <span aria-hidden="true">✓</span> {labels.inQuote} · <span className="font-mono">{model}</span> ×{" "}
                <span className="tabular-nums">{line.qty}</span>
              </span>{" "}
              <Link href={quoteHref} className="font-semibold underline underline-offset-2">
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
        <div className="page-container flex items-center gap-3">
          {stepper}
          {addButton}
        </div>
      </div>
    </>
  );
}
