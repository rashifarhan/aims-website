"use client";

import Form from "next/form";
import { useEffect, useRef } from "react";
import { SearchIcon } from "@/components/icons";

type Props = {
  action: string;
  placeholder: string;
  submitLabel: string;
  id: string;
  className?: string;
  /** Listen for "/" and show the hint (desktop header only). */
  shortcut?: boolean;
};

/**
 * Header search. A real GET form to the listing (?q=), so it works before
 * JavaScript loads; "/" focuses it. Suggestions (MiniSearch) come with the
 * catalogue build.
 */
export function HeaderSearch({ action, placeholder, submitLabel, id, className = "", shortcut = false }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
        return;
      e.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  return (
    <Form action={action} role="search" className={`relative ${className}`}>
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
        autoComplete="off"
        enterKeyHint="search"
        placeholder={placeholder}
        className={`peer h-10 w-full ${shortcut ? "pe-10" : "pe-4"} rounded-pill border border-line-strong bg-paper-2 ps-10 text-sm text-ink placeholder:text-ink-400 focus:border-green-700 focus:bg-paper focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-700`}
      />
      {shortcut && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-[5px] border border-line bg-paper px-1.5 font-mono text-[11px] text-ink-600 peer-focus:hidden"
        >
          /
        </kbd>
      )}
      <button type="submit" className="sr-only">
        {submitLabel}
      </button>
    </Form>
  );
}
