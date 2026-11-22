"use client";

import type { Dictionary } from "@/i18n/dictionaries";
import { REPLY_CHANNELS, type Contact } from "@/lib/quote/request";
import { ChipRadios, Field, inputClass } from "./fields";

type Props = {
  contact: Contact;
  onChange: (patch: Partial<Contact>) => void;
  t: Dictionary["quote"];
  errors: Partial<Record<"name" | "phone" | "email", string>>;
};

/**
 * Panel 3: contact details. Held in memory only, never saved to the
 * browser (Design Doc 10, T8 persistence rule). Autocomplete is on so
 * people don't retype what the browser knows (WCAG 3.3.7).
 */
export function DetailsPanel({ contact: c, onChange, t, errors }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="quote-name" label={t.name} error={errors.name}>
          {(a) => (
            <input
              {...a}
              value={c.name}
              autoComplete="name"
              maxLength={80}
              onChange={(e) => onChange({ name: e.target.value })}
              className={inputClass}
            />
          )}
        </Field>
        <Field id="quote-company" label={t.company}>
          {(a) => (
            <input
              {...a}
              value={c.company}
              autoComplete="organization"
              maxLength={100}
              onChange={(e) => onChange({ company: e.target.value })}
              className={inputClass}
            />
          )}
        </Field>
        <Field id="quote-phone" label={t.phone} hint={t.phoneHint} error={errors.phone}>
          {(a) => (
            <input
              {...a}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              value={c.phone}
              maxLength={24}
              onChange={(e) => onChange({ phone: e.target.value })}
              className={`${inputClass} text-start`}
            />
          )}
        </Field>
        <Field id="quote-email" label={c.replyBy === "email" ? t.email : t.emailOptional} error={errors.email}>
          {(a) => (
            <input
              {...a}
              type="email"
              autoComplete="email"
              dir="ltr"
              value={c.email}
              maxLength={120}
              onChange={(e) => onChange({ email: e.target.value })}
              className={`${inputClass} text-start`}
            />
          )}
        </Field>
      </div>
      <ChipRadios
        name="reply"
        legend={t.replyBy}
        options={REPLY_CHANNELS.map((r) => ({ value: r, label: t.replyChannels[r] }))}
        value={c.replyBy}
        onChange={(replyBy) => onChange({ replyBy })}
      />
      {/* Honeypot (Plan A07: replaces the math CAPTCHA). Hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
        <label htmlFor="quote-website">{t.honeypot}</label>
        <input
          id="quote-website"
          tabIndex={-1}
          autoComplete="off"
          value={c.website}
          onChange={(e) => onChange({ website: e.target.value })}
        />
      </div>
    </div>
  );
}
