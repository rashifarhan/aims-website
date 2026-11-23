"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { href: string; labels: Dictionary["contactPreview"] };

/** Design Doc 6: absent from the hero; Plan 16: preview before opening a real contact channel. */
export function FloatingContact({ href, labels }: Props) {
  const [visible, setVisible] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = useId();
  useEffect(() => {
    const hero = document.querySelector(".home-hero");
    const footer = document.querySelector("footer");
    if (!hero) return;
    let beyondHero = false;
    let atFooter = false;
    const sync = () => {
      const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
      setVisible(beyondHero && !atFooter && !editing);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) beyondHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 72;
          if (entry.target === footer) atFooter = entry.isIntersecting;
        }
        sync();
      },
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(hero);
    if (footer) observer.observe(footer);
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", sync);
    };
  }, []);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        hidden={!visible}
        className="home-button home-button-sm home-floating-contact"
        aria-label={labels.trigger}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <WhatsAppIcon />
        <span>{labels.trigger}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={title}
        className="home-contact-dialog motion-fade"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
        onClose={() => trigger.current?.focus()}
      >
        <h2 id={title} className="text-xl font-semibold">
          {labels.title}
        </h2>
        <p className="mt-4 text-ink-600">{labels.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => dialog.current?.close()}
            className="home-button home-button-outline home-button-sm"
          >
            {labels.cancel}
          </button>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => dialog.current?.close()}
            className="home-button home-button-sm"
          >
            {labels.open}
          </a>
        </div>
        <p className="mt-3 text-caption text-ink-600">{labels.newTab}</p>
      </dialog>
    </>
  );
}
