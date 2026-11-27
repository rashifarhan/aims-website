"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { scrollToY } from "@/components/inside/scrollTo";

/** The list's top, under the sticky header. */
function listTop() {
  const list = document.getElementById("products");
  if (!list) return null;
  const header = document.querySelector("header")?.offsetHeight ?? 0;
  return list.getBoundingClientRect().top + window.scrollY - header;
}

/**
 * Picking a family, a shortcut or a search on a products page shows the result in the list below, in place: the URL
 * takes the filter (the list reads it, so Back restores it) and the page glides down to the list. Links and the form
 * marked `data-jump` do the same as plain navigation without JavaScript; those carrying a filter are not prefetched,
 * since they never navigate while this runs (and prefetching a URL with search data warns on the family route). Capture phase, so next/link sees the click
 * already handled (defaultPrevented) and leaves it.
 */
export function ListingJump() {
  const router = useRouter();
  useEffect(() => {
    const go = (url: URL) => {
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
      // After the list has rendered the new filter, so it is measured at its new height.
      requestAnimationFrame(() => {
        const y = listTop();
        if (y !== null) scrollToY(y, 0.9);
      });
    };
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-jump]");
      if (!link) return;
      const url = new URL(link.href);
      if (url.pathname !== window.location.pathname) return;
      event.preventDefault();
      go(url);
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      if (!form.matches("form[data-jump]")) return;
      const url = new URL(form.action);
      if (url.pathname !== window.location.pathname) return;
      event.preventDefault();
      const q = new FormData(form).get("q");
      url.search = typeof q === "string" && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      go(url);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [router]);
  return null;
}
