"use client";

import type { ReactNode } from "react";
import { LIVE_CONTACT } from "@/lib/site";
import { useContactGuard, type ContactKind } from "./ContactGuard";

type Props = {
  kind: ContactKind;
  href: string;
  /** Number or address shown in the preview notice. */
  target: string;
  /** Prefilled WhatsApp text, shown in the notice. */
  message?: string;
  className?: string;
  children: ReactNode;
};

/**
 * A WhatsApp / tel: / mailto: link. It contacts AIMS only when
 * NEXT_PUBLIC_LIVE_CONTACT is "true"; otherwise the click opens the preview
 * notice (risk R5). The href stays real, so the link is honest about where
 * it goes and still works without JavaScript.
 */
export function ContactLink({ kind, href, target, message, className, children }: Props) {
  const guard = useContactGuard();
  return (
    <a
      href={href}
      target={kind === "whatsapp" ? "_blank" : undefined}
      rel={kind === "whatsapp" ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (LIVE_CONTACT || !guard) return;
        e.preventDefault();
        guard({ kind, href, target, message });
      }}
      className={className}
    >
      {children}
    </a>
  );
}
