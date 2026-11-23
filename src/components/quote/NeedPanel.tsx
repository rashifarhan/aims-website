"use client";

import type { Dictionary } from "@/i18n/dictionaries";
import { BUYER_TYPES, NEEDS, type QuoteContext } from "@/lib/quote/context";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { ChipRadios } from "./fields";
import { ExportFields, InstallFields, SoftwareFields, SupplyFields } from "./NeedFields";

type Props = {
  context: QuoteContext;
  hasSoftware: boolean;
  t: Dictionary["quote"];
  errors: Partial<Record<"need" | "emirate" | "country", string>>;
};

const set = (patch: Partial<QuoteContext>) => dispatchQuote({ type: "setContext", patch });

/**
 * Panel 2: the need, with fields that adapt to it (Design Doc 10, T8):
 * supply → city, timing · install → emirate, site, doors/users, existing
 * system · software → the existing system · export → country, city/port, documents. Saved with the list.
 */
export function NeedPanel({ context: c, t, errors, hasSoftware }: Props) {
  // The software need is offered only when the list holds software (or it is already chosen).
  const needs = hasSoftware || c.need === "software" ? NEEDS : NEEDS.filter((need) => need !== "software");
  return (
    <div className="space-y-6">
      <fieldset aria-describedby={errors.need ? "need-error" : undefined}>
        <legend className="sr-only">{t.needHeading}</legend>
        <div className={needs.length === 4 ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-3"}>
          {needs.map((n, i) => (
            <label
              key={n}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-line-strong p-3.5 has-checked:border-green-700 has-checked:bg-green-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-700"
            >
              <input
                type="radio"
                name="need"
                id={i === 0 ? "need" : undefined}
                value={n}
                checked={c.need === n}
                onChange={() => set({ need: n })}
                className="mt-1 size-4.5 shrink-0 accent-green-700"
              />
              <span>
                <span className="block font-semibold text-ink">{t.needs[n]}</span>
                <span className="block text-sm text-ink-600">{t.needHints[n]}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.need && (
          <p id="need-error" className="mt-2 text-sm font-medium text-error">
            {errors.need}
          </p>
        )}
      </fieldset>

      {c.need === "supply" && <SupplyFields context={c} t={t} />}

      {c.need === "install" && <InstallFields context={c} t={t} errors={errors} />}

      {c.need === "software" && <SoftwareFields context={c} t={t} />}

      {c.need === "export" && <ExportFields context={c} t={t} errors={errors} />}

      <ChipRadios
        name="buyer"
        legend={t.buyerType}
        options={BUYER_TYPES.map((b) => ({ value: b, label: t.buyers[b] }))}
        value={c.buyerType}
        onChange={(b) => set({ buyerType: b })}
      />
    </div>
  );
}
