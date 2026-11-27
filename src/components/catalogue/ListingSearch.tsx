"use client";

import { SearchIcon } from "@/components/icons";

type Props = { value: string; onChange: (q: string) => void; label: string; placeholder: string };

/** The listing's own search field (Design Doc 10, T4): filters as you type; the value lives in the URL. */
export function ListingSearch({ value, onChange, label, placeholder }: Props) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="lst-search">
      <label htmlFor="listing-search" className="sr-only">
        {label}
      </label>
      <SearchIcon className="lst-search-icon" />
      <input
        id="listing-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="lst-search-input"
      />
    </form>
  );
}
