import type { ReactNode } from "react";

/**
 * The one section box (design-taste-frontend one system; CLAUDE.md §2 "one section per screen"): every
 * section below the hero takes the same vertical rhythm, --section-space (globals.css). `paper` is the
 * page ground and the section is its own content box; `band` (paper-2 with hairlines) and `night` (night
 * green) run full-bleed with the content box inside. `className` stays on the <section>, so a dealt moment's
 * CSS keyed to [data-played] keeps working (`moment` sets data-moment for MomentTrigger).
 */
export function Section({
  ground = "paper",
  id,
  labelledBy,
  className,
  moment = false,
  children,
}: {
  ground?: "paper" | "band" | "night";
  id?: string;
  /** The id of the section's heading; a section without a visible heading needs none. */
  labelledBy?: string;
  className?: string;
  moment?: boolean;
  children: ReactNode;
}) {
  const classes = ["section", `section-${ground}`, ground === "paper" ? "wrap" : "", className ?? ""];
  return (
    <section
      id={id}
      className={classes.filter(Boolean).join(" ")}
      aria-labelledby={labelledBy}
      data-moment={moment || undefined}
    >
      {ground === "paper" ? children : <div className="wrap">{children}</div>}
    </section>
  );
}
