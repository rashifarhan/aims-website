import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowIcon } from "@/components/icons";

/** The one primary action of direction 2 (CLAUDE.md → Design rules, Components): a pill with a dark arrow circle. */
export function StagePill({ children, className, ...link }: ComponentProps<typeof Link>) {
  return (
    <Link {...link} className={`in-pill ${className ?? ""}`}>
      {children}
      <span className="in-pill-arrow" aria-hidden="true">
        <ArrowIcon width="18" height="18" />
      </span>
    </Link>
  );
}
