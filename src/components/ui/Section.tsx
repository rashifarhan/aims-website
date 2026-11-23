import type { ReactNode } from "react";

/**
 * The one section box (design-taste-frontend one system; CLAUDE.md §2 "one section per screen"). The <section> is
 * the ground (paper, band with hairlines, or night green) and holds one in-flow `.wrap`, the content line every
 * section shares (layout-v4.md 2, SR-6). Its height is its content plus the shared rhythm (README Decisions: no
 * forced screen heights). `className` stays on the
 * <section>, so a dealt moment's CSS keyed to [data-played] keeps working (`moment` sets data-moment for
 * MomentTrigger).
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
  const classes = ["section", `section-${ground}`, className ?? ""];
  return (
    <section
      id={id}
      className={classes.filter(Boolean).join(" ")}
      aria-labelledby={labelledBy}
      data-moment={moment || undefined}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}
