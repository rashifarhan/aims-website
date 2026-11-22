"use client";

import Form from "next/form";
import { SearchIcon } from "@/components/icons";
import type { SearchEntry } from "@/lib/searchSuggestions";
import type { Dictionary } from "@/i18n/dictionaries";
import { SearchResults } from "./SearchResults";
import { useHeaderSearch } from "./useHeaderSearch";

type Props = {
  action: string;
  placeholder: string;
  submitLabel: string;
  id: string;
  className?: string;
  shortcut?: boolean;
  entries: SearchEntry[];
  labels: Dictionary["search"];
};

/** Real GET fallback plus a local, keyboard-operated 150ms combobox (Design Doc 8.4; AT-03). */
export function HeaderSearch({
  action,
  placeholder,
  submitLabel,
  id,
  className = "",
  shortcut = false,
  entries,
  labels,
}: Props) {
  const { ref, query, setQuery, results, resolved, open, setOpen, active, setActive, listId, expanded, select } =
    useHeaderSearch(entries, id, shortcut);
  return (
    <Form
      action={action}
      role="search"
      className={`relative ${className}`}
      onSubmit={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <SearchIcon
        width={18}
        height={18}
        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-400"
      />
      <input
        ref={ref}
        id={id}
        name="q"
        type="search"
        role="combobox"
        autoComplete="off"
        enterKeyHint="search"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-option-${active}` : undefined}
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            setActive(-1);
          } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length && resolved === query) {
            event.preventDefault();
            setOpen(true);
            setActive((value) =>
              event.key === "ArrowDown" ? (value + 1) % results.length : value <= 0 ? results.length - 1 : value - 1,
            );
          } else if (event.key === "Enter" && expanded && active >= 0) {
            event.preventDefault();
            const entry = results[active];
            if (entry) select(entry);
          }
        }}
        className={`peer h-11 w-full ${shortcut ? "pe-4 xl:pe-10" : "pe-4"} rounded-pill border border-line-strong bg-paper-2 ps-10 text-base text-ink placeholder:text-ink-400 focus:border-green-700 focus:bg-paper focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700`}
      />
      {shortcut && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-xs border border-line bg-paper px-1.5 font-mono text-kbd text-ink-600 peer-focus:hidden max-xl:invisible"
        >
          /
        </kbd>
      )}
      {expanded && (
        <SearchResults id={listId} results={results} query={query} active={active} labels={labels} select={select} />
      )}
      {open && query.trim() && resolved === query && !results.length && (
        <p className="absolute inset-x-0 top-full z-40 mt-2 rounded-md border border-line bg-paper p-3 text-small text-ink-600 shadow-2">
          {labels.empty}
        </p>
      )}
      <span className="sr-only" role="status">
        {open && query.trim() && resolved === query
          ? results.length
            ? labels.count.replace("{count}", String(results.length))
            : labels.empty
          : ""}
      </span>
      <button
        type="submit"
        className="sr-only focus:not-sr-only focus:absolute focus:end-0 focus:top-full focus:z-40 focus:min-h-11 focus:rounded-sm focus:bg-paper focus:px-3 focus:text-green-700"
      >
        {submitLabel}
      </button>
    </Form>
  );
}
