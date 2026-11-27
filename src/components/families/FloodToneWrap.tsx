"use client";

import { useRef, type ReactNode } from "react";
import { useHeaderTone } from "./useHeaderTone";

/** Wraps a page's opening flood so the sticky header turns clear over it and back to paper below it. */
export function FloodToneWrap({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  useHeaderTone(wrap);
  return (
    <div ref={wrap} className="fam-wrap" data-tone="ground">
      {children}
    </div>
  );
}
