"use client";

import { SearchIcon } from "@/components/icons";

type Props = { value: string; onChange: (q: string) => void; label: string; placeholder: string };

/** The listing's own search field (Design Doc 10, T4): filters as you type; the value lives in the URL. */
export function ListingSearch({ value, onChange, label, placeholder }: Props) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-6 max-w-xl">
      <label htmlFor="listing-search" className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        id="listing-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="h-12 w-full rounded-md border border-line-strong bg-paper ps-12 pe-4 text-base text-ink placeholder:text-ink-400 focus:border-green-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700"
      />
    </form>
  );
}
