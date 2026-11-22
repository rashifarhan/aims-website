import type { ReactNode } from "react";

/** A numbered quote panel (Design Doc 10, T8: Items · What do you need? · Your details). */
export function Panel({ n, title, id, children }: { n: number; title: string; id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-lg border border-line bg-paper p-4 sm:p-6">
      <h2 id={id} className="flex items-center gap-3 text-lg font-semibold text-ink">
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-pill bg-green-50 text-sm text-green-700"
        >
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (a11y: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode;
};

/** Label + control + hint + error, wired with aria-describedby / aria-invalid (Design Doc 14). */
export function Field({ id, label, hint, error, children }: FieldProps) {
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children({ id, "aria-describedby": described, ...(error ? { "aria-invalid": true as const } : {}) })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** 16px text so iOS doesn't zoom on focus (Design Doc 5). */
export const inputClass =
  "h-12 w-full rounded-md border border-line-strong bg-paper px-3.5 text-base text-ink placeholder:text-ink-400 focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700 aria-invalid:border-error";

/** Radio options styled as chips; native radios underneath. */
export function ChipRadios<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-line-strong px-4 text-sm font-medium text-ink-700 has-checked:border-green-700 has-checked:bg-green-50 has-checked:text-green-800 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-700"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
