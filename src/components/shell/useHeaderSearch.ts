"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { searchSuggestions, type SearchEntry } from "@/lib/searchSuggestions";

export function useHeaderSearch(entries: SearchEntry[], id: string, shortcut: boolean) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [resolved, setResolved] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${id}-results`;
  const expanded = open && !!query.trim() && resolved === query && results.length > 0;
  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(searchSuggestions(entries, query));
      setResolved(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, entries]);
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      )
        return;
      event.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);
  const select = (entry: SearchEntry) => {
    setOpen(false);
    if (entry.href.startsWith("https://")) window.location.assign(entry.href);
    else router.push(entry.href);
  };
  return { ref, query, setQuery, results, resolved, open, setOpen, active, setActive, listId, expanded, select };
}
