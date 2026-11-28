"use client";

import dynamic from "next/dynamic";
import type { FloatingContactProps } from "./FloatingContact";

// The dock never shows in the first screen, so its code stays out of the bundle every page hydrates first: it loads
// after hydration, and the first tap on a page (Add to quote, say) never waits for it (CLAUDE.md §3).
const FloatingContact = dynamic(() => import("./FloatingContact").then((m) => m.FloatingContact), { ssr: false });

export function FloatingContactLazy(props: FloatingContactProps) {
  return <FloatingContact {...props} />;
}
