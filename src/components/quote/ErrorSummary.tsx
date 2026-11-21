"use client";

import type { Ref } from "react";

export type SummaryError = { fieldId: string; message: string };

/**
 * Error summary (Design Doc 9): takes focus after a failed send; each item
 * links to its field. Entries are kept (AT-05).
 */
export function ErrorSummary({
  heading,
  errors,
  ref,
}: {
  heading: string;
  errors: SummaryError[];
  ref: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-labelledby="error-summary-title"
      className="rounded-lg border-2 border-error bg-paper p-4 sm:p-5"
    >
      <h2 id="error-summary-title" className="font-semibold text-error">
        {heading}
      </h2>
      <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
        {errors.map((e) => (
          <li key={e.fieldId + e.message}>
            <a
              href={`#${e.fieldId}`}
              onClick={(ev) => {
                const el = document.getElementById(e.fieldId);
                if (!el) return;
                ev.preventDefault();
                el.scrollIntoView({ block: "center" });
                el.focus();
              }}
              className="font-medium text-error underline underline-offset-2"
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
