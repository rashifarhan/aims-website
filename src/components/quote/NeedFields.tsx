import type { Dictionary } from "@/i18n/dictionaries";
import { EMIRATES, SITE_TYPES, TIMINGS, type QuoteContext } from "@/lib/quote/context";
import { dispatchQuote } from "@/lib/quote/useQuote";
import { Field } from "./fields";
import { Select, TextInput } from "./needInputs";

type Props = {
  context: QuoteContext;
  t: Dictionary["quote"];
  errors: Partial<Record<"need" | "emirate" | "country", string>>;
};

const set = (patch: Partial<QuoteContext>) => dispatchQuote({ type: "setContext", patch });
const digits = (v: string) => v.replace(/\D/g, "");

/** The timing select closes every branch of the need-specific fields. */
function Timing({ context: c, t }: Pick<Props, "context" | "t">) {
  return (
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
}

export function SupplyFields({ context: c, t }: Pick<Props, "context" | "t">) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="quote-city" label={t.city}>
        {(a) => (
          <TextInput {...a} value={c.city} max={80} autoComplete="address-level2" onChange={(city) => set({ city })} />
        )}
      </Field>
      <Timing context={c} t={t} />
    </div>
  );
}

export function InstallFields({ context: c, t, errors }: Props) {
  return (
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
          <TextInput {...a} inputMode="numeric" value={c.doors} max={6} onChange={(v) => set({ doors: digits(v) })} />
        )}
      </Field>
      <Field id="quote-users" label={t.users}>
        {(a) => (
          <TextInput {...a} inputMode="numeric" value={c.users} max={6} onChange={(v) => set({ users: digits(v) })} />
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
      <Timing context={c} t={t} />
    </div>
  );
}

export function ExportFields({ context: c, t, errors }: Props) {
  return (
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
      <Timing context={c} t={t} />
    </div>
  );
}
