"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { CloseIcon } from "@/components/icons";

export type ContactKind = "whatsapp" | "phone" | "email";
export type ContactRequest = { kind: ContactKind; href: string; target: string; message?: string };

const GuardContext = createContext<((req: ContactRequest) => void) | null>(null);

/**
 * One shared preview notice for every WhatsApp, phone and email link
 * (Plan ch. 16 honesty boundary, risk R5). The buyer sees exactly what
 * would be sent and to whom, can copy it, and can still open it
 * deliberately; nothing reaches AIMS by accident.
 */
export function ContactGuardProvider({
  labels,
  children,
}: {
  labels: Dictionary["contactGuard"];
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [req, setReq] = useState<ContactRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const open = useCallback((r: ContactRequest) => {
    setReq(r);
    setCopied(false);
    dialog.current?.showModal();
  }, []);
  const close = () => dialog.current?.close();

  return (
    <GuardContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="contact-guard-title"
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto w-[min(100vw-2rem,30rem)] rounded-lg bg-paper p-0 text-ink shadow-3 backdrop:bg-ink/40"
      >
        {req && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 id="contact-guard-title" className="text-lg font-semibold">
                {labels.title}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label={labels.close}
                className="-me-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-md"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="mt-2 text-ink-700">{fmt(labels[req.kind], { target: req.target })}</p>
            {req.message && (
              <>
                <p className="mt-4 text-sm font-semibold">{labels.message}</p>
                <pre className="mt-1 max-h-60 overflow-auto rounded-md bg-green-50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink">
                  {req.message}
                </pre>
              </>
            )}
            <p className="mt-4 text-sm font-medium text-warn">{labels.nothingSent}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" autoFocus onClick={close} className="home-button home-button-sm">
                {labels.close}
              </button>
              {req.message && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(req.message ?? "");
                      setCopied(true);
                    } catch {
                      setCopied(false); // clipboard blocked: the text above can still be selected
                    }
                  }}
                  className="home-button home-button-outline home-button-sm"
                >
                  {copied ? labels.copied : labels.copy}
                </button>
              )}
              <a
                href={req.href}
                target={req.kind === "whatsapp" ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={close}
                className="inline-flex h-11 items-center px-2 text-sm font-semibold text-ink-700 underline underline-offset-2"
              >
                {labels.openAnyway}
              </a>
            </div>
            <p role="status" className="sr-only">
              {copied ? labels.copied : ""}
            </p>
          </div>
        )}
      </dialog>
    </GuardContext.Provider>
  );
}

/** Opens the preview notice for a contact action. */
export function useContactGuard() {
  return useContext(GuardContext);
}
