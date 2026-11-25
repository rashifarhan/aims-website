"use client";

import { useEffect, useRef } from "react";
import { NavigationLink as Link } from "./NavigationLink";
import { ListIcon } from "@/components/icons";
import { getQuote } from "@/lib/quote/store";
import { useQuote } from "@/lib/quote/useQuote";

type Props = { externalLabel: string; href: string; label: string; itemsLabel: string; className?: string };

/** The hero tick's path (HeroTick.tsx), so the badge confirms with the same VERIFY mark. */
const TICK = "m5 12 4.5 4.5L19 7";
/** ~300ms micro VERIFY (Design Doc 8.4: confirmations under 400ms). */
const VERIFY_MS = 320;
/** The ring that spreads from the badge, so an eye on the card catches it in the corner (client approval, 25 Nov 2026). */
const RING_MS = 700;

/** Header "Quote" pill with a live item count (0 on the server, real after hydration). */
export function QuoteLink({ href, label, itemsLabel, externalLabel, className = "" }: Props) {
  const { lines } = useQuote();
  const count = lines.length;
  // Units, not lines, decide a rise: raising a quantity confirms too, not only a new model.
  const units = lines.reduce((sum, line) => sum + line.qty, 0);
  const seen = useRef<number | null>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const tickRef = useRef<SVGSVGElement>(null);

  // Micro VERIFY: when the list grows the badge bumps, a lime ring spreads from it, and it shows ✓ before settling
  // to the number. The first commit is the server snapshot (0), so start from the stored units: loading a page
  // never "verifies". Transform and opacity only; reduced motion skips it (CLAUDE.md §3).
  useEffect(() => {
    if (seen.current === null) {
      seen.current = getQuote().lines.reduce((sum, line) => sum + line.qty, 0);
      return;
    }
    const rose = units > seen.current;
    seen.current = units;
    if (!rose || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The site curve comes from its token, so the badge moves like every other control.
    const ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-aims").trim();
    const timing = { duration: VERIFY_MS, easing: ease || "ease-out" };
    badgeRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.35 }, { transform: "scale(1)" }],
      { duration: 420, easing: ease || "ease-out" },
    );
    ringRef.current?.animate(
      [
        { opacity: 0.8, transform: "scale(1)" },
        { opacity: 0, transform: "scale(2.6)" },
      ],
      { duration: RING_MS, easing: "ease-out" },
    );
    tickRef.current?.animate(
      [
        { opacity: 0, transform: "scale(0.6)" },
        { opacity: 1, transform: "scale(1)", offset: 0.3 },
        { opacity: 1, transform: "scale(1)", offset: 0.65 },
        { opacity: 0, transform: "scale(1)" },
      ],
      timing,
    );
    numberRef.current?.animate(
      [
        { opacity: 0, transform: "translateY(3px)" },
        { opacity: 0, transform: "translateY(3px)", offset: 0.65 },
        { opacity: 1, transform: "none" },
      ],
      timing,
    );
  }, [units]);

  return (
    <Link
      externalLabel={externalLabel}
      href={href}
      // The one button's small outline (actions.css; Design Doc 9 Button): same step, press and focus as every
      // other button on the site.
      className={`home-button home-button-outline home-button-sm whitespace-nowrap ${className}`}
    >
      <ListIcon width={18} height={18} className="hidden sm:block" />
      <span>{label}</span>
      {count > 0 && (
        <span
          ref={badgeRef}
          className="relative grid h-5 min-w-5 place-items-center rounded-pill bg-green-700 px-1.5 text-xs font-semibold text-white tabular-nums"
        >
          <span
            ref={ringRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-pill border-2 border-lime opacity-0"
          />
          <span ref={numberRef}>{count}</span>
          <svg
            ref={tickRef}
            data-quote-tick
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="absolute inset-0 m-auto size-3.5 opacity-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={TICK} />
          </svg>
          {/* Accessible name "Quote 3 items" keeps the visible "Quote 3" in it (WCAG 2.5.3). */}
          <span className="sr-only"> {itemsLabel}</span>
        </span>
      )}
    </Link>
  );
}
