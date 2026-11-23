"use client";

import { useRouter } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { dispatchQuote } from "@/lib/quote/useQuote";

type Props = { slug: string; text: string; label: string; quoteHref: string; compact?: boolean };

export function SoftwareEnquiryButton({ slug, text, label, quoteHref, compact }: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={compact ? "home-text-link relative z-1 mt-3 min-h-11 self-start" : "home-button"}
      onClick={() => {
        dispatchQuote({ type: "requestSoftware", slug, text });
        router.push(quoteHref);
      }}
    >
      {label}
      {!compact && <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />}
    </button>
  );
}
