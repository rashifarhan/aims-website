"use client";

import { useState } from "react";
import { MAX_QTY } from "@/lib/quote/store";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  /** "lg" matches the full-height .home-button it sits beside on the product page. */
  size?: "lg" | "md" | "sm";
};

/**
 * − [qty] + with a typeable field (Design Doc 9). Buttons are 44px on
 * touch; the field commits on blur or Enter so typing "12" doesn't
 * dispatch "1" first.
 */
export function QtyStepper({ value, onChange, label, decreaseLabel, increaseLabel, size = "md" }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) onChange(Math.min(MAX_QTY, Math.max(1, n)));
    setDraft(null);
  };
  // sm matches the 44px outline button it replaces on a card, so the card keeps its height (CLAUDE.md §4).
  const box = { lg: "h-(--home-button-height)", md: "h-11", sm: "h-11" }[size];
  const btn = { lg: "w-12", md: "w-11", sm: "w-11" }[size];

  return (
    <div className={`inline-flex ${box} items-stretch overflow-hidden rounded-pill border border-line-strong bg-paper`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={decreaseLabel}
        className={`${btn} grid place-items-center text-lg text-ink-700 hover:bg-paper-2 active:bg-paper-3 disabled:text-ink-300`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget.value)}
        className="w-12 border-x border-line bg-transparent text-center text-base font-semibold tabular-nums focus-visible:bg-green-50"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_QTY, value + 1))}
        aria-label={increaseLabel}
        className={`${btn} grid place-items-center text-lg text-ink-700 hover:bg-paper-2 active:bg-paper-3`}
      >
        +
      </button>
    </div>
  );
}
