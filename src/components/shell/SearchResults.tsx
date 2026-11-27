import { useEffect, useRef } from "react";
import { highlightMatches, type SearchEntry } from "@/lib/searchSuggestions";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  id: string;
  results: SearchEntry[];
  query: string;
  active: number;
  labels: Dictionary["search"];
  select: (entry: SearchEntry) => void;
};
export function SearchResults({ id, results, query, active, labels, select }: Props) {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (active >= 0) list.current?.children.item(active)?.scrollIntoView({ block: "nearest" });
  }, [active]);
  return (
    <ul
      ref={list}
      id={id}
      role="listbox"
      aria-label={labels.suggestions}
      className="header-panel absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-auto rounded-md border border-line bg-paper p-2 shadow-2"
    >
      {results.map((entry, index) => (
        <li
          id={`${id}-option-${index}`}
          key={entry.href}
          role="option"
          aria-selected={active === index}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => select(entry)}
          className={`flex min-h-14 cursor-pointer flex-col justify-center gap-1 rounded-sm px-3 py-2 text-start ${active === index ? "bg-green-50" : "hover:bg-paper-2"}`}
        >
          <span className="text-small text-ink">
            {highlightMatches(entry.label, query).map((part, i) =>
              part.match ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>,
            )}
          </span>
          <span className="text-caption text-ink-600">
            {labels[entry.kind]}
            {entry.href.startsWith("https://") ? ` · ${labels.external}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
