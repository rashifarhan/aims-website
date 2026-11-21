"use client";

import type { InputHTMLAttributes } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { BUYER_TYPES, EMIRATES, NEEDS, SITE_TYPES, TIMINGS, type QuoteContext } from "@/lib/quote/context";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { ChipRadios, Field, inputClass } from "./fields";

type Props = {
  context: QuoteContext;
  t: Dictionary["quote"];
  errors: Partial<Record<"need" | "emirate" | "country", string>>;
};

const set = (patch: Partial<QuoteContext>) => dispatchQuote({ type: "setContext", patch });

type SelectProps = {
  id: string;
  value: string | undefined;
  options: readonly string[];
  labels: Record<string, string>;
  placeholder: string;
  onChange: (v: string) => void;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

function Select({ value, options, labels, placeholder, onChange, ...a11y }: SelectProps) {
  return (
    <select {...a11y} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {labels[o]}
        </option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  max,
  onChange,
  ...rest
}: { id: string; value?: string; max: number; onChange: (v: string) => void } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <input
      {...rest}
      value={value ?? ""}
      maxLength={max}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

const digits = (v: string) => v.replace(/\D/g, "");

/**
 * Panel 2: the need, with fields that adapt to it (Design Doc 10, T8):
 * supply → city, timing · install → emirate, site, doors/users, existing
 * system · export → country, city/port, documents. Saved with the list.
 */
export function NeedPanel({ context: c, t, errors }: Props) {
  const timing = (
    <Field id="quote-timing" label={t.timing}>
      {(a) => (
        <Select
          {...a}
          value={c.timing}
          options={TIMINGS}
          labels={t.timings}
          placeholder={t.choose}
          onChange={(v) => set({ timing: (v || undefined) as QuoteContext["timing"] })}
        />
      )}
    </Field>
  );

  return (
    <div className="space-y-6">
      <fieldset aria-describedby={errors.need ? "need-error" : undefined}>
        <legend className="sr-only">{t.needHeading}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {NEEDS.map((n, i) => (
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

      {c.need === "supply" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="quote-city" label={t.city}>
            {(a) => (
              <TextInput
                {...a}
                value={c.city}
                max={80}
                autoComplete="address-level2"
                onChange={(city) => set({ city })}
              />
            )}
          </Field>
          {timing}
        </div>
      )}

      {c.need === "install" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="quote-emirate" label={t.emirate} error={errors.emirate}>
            {(a) => (
              <Select
                {...a}
                value={c.emirate}
                options={EMIRATES}
                labels={t.emirates}
                placeholder={t.choose}
                onChange={(v) => set({ emirate: (v || undefined) as QuoteContext["emirate"] })}
              />
            )}
          </Field>
          <Field id="quote-site" label={t.siteType}>
            {(a) => (
              <Select
                {...a}
                value={c.siteType}
                options={SITE_TYPES}
                labels={t.siteTypes}
                placeholder={t.choose}
                onChange={(v) => set({ siteType: (v || undefined) as QuoteContext["siteType"] })}
              />
            )}
          </Field>
          <Field id="quote-doors" label={t.doors}>
            {(a) => (
              <TextInput
                {...a}
                inputMode="numeric"
                value={c.doors}
                max={6}
                onChange={(v) => set({ doors: digits(v) })}
              />
            )}
          </Field>
          <Field id="quote-users" label={t.users}>
            {(a) => (
              <TextInput
                {...a}
                inputMode="numeric"
                value={c.users}
                max={6}
                onChange={(v) => set({ users: digits(v) })}
              />
            )}
          </Field>
          <div className="sm:col-span-2">
            <Field id="quote-existing" label={t.existing}>
              {(a) => (
                <TextInput
                  {...a}
                  value={c.existing}
                  max={120}
                  placeholder={t.existingPlaceholder}
                  onChange={(existing) => set({ existing })}
                />
              )}
            </Field>
          </div>
          {timing}
        </div>
      )}

      {c.need === "export" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="quote-country" label={t.country} error={errors.country}>
            {(a) => (
              <TextInput
                {...a}
                value={c.country}
                max={60}
                autoComplete="country-name"
                onChange={(country) => set({ country })}
              />
            )}
          </Field>
          <Field id="quote-port" label={t.port}>
            {(a) => <TextInput {...a} value={c.port} max={80} onChange={(port) => set({ port })} />}
          </Field>
          <div className="sm:col-span-2">
            <Field id="quote-documents" label={t.documents}>
              {(a) => <TextInput {...a} value={c.documents} max={160} onChange={(documents) => set({ documents })} />}
            </Field>
          </div>
          {timing}
        </div>
      )}

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
