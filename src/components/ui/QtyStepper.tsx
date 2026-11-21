"use client";

import { useState } from "react";
import { MAX_QTY } from "@/lib/quote/store";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  size?: "md" | "sm";
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
  const box = size === "md" ? "h-11" : "h-11 sm:h-9";
  const btn = size === "md" ? "w-11" : "w-11 sm:w-9";

  return (
    <div className={`inline-flex ${box} items-stretch overflow-hidden rounded-pill border border-line-strong bg-paper`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={decreaseLabel}
        className={`${btn} grid place-items-center text-lg text-ink-700 hover:bg-paper-2 disabled:text-ink-300`}
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
        className="w-12 border-x border-line bg-transparent text-center text-base font-semibold tabular-nums focus:outline-none focus-visible:bg-green-50"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_QTY, value + 1))}
        aria-label={increaseLabel}
        className={`${btn} grid place-items-center text-lg text-ink-700 hover:bg-paper-2`}
      >
        +
      </button>
    </div>
  );
}
