import type { InputHTMLAttributes } from "react";
import { inputClass } from "./fields";

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

export function Select({ value, options, labels, placeholder, onChange, ...a11y }: SelectProps) {
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

export function TextInput({
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
