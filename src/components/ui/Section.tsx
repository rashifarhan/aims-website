import type { CSSProperties, ReactNode } from "react";

/**
 * The one section box (design-taste-frontend one system; CLAUDE.md §2 "one section per screen"). The <section> is
 * the ground (paper, band with hairlines, or night green) and holds one in-flow `.wrap`, the content line every
 * section shares (layout-v4.md 2, SR-6). `screens` is the kit's `--h` contract: on a desktop screen and on a phone
 * the section is one or two screens tall (ui/sections.css), so a screen shows one section. `className` stays on the
 * <section>, so a dealt moment's CSS keyed to [data-played] keeps working (`moment` sets data-moment for
 * MomentTrigger).
 */
export function Section({
  ground = "paper",
  id,
  labelledBy,
  className,
  moment = false,
  screens = 1,
  children,
}: {
  ground?: "paper" | "band" | "night";
  id?: string;
  /** The id of the section's heading; a section without a visible heading needs none. */
  labelledBy?: string;
  className?: string;
  moment?: boolean;
  /** How many screens the section fills (layout-v4.md 2: one, or two when its content needs more than one). */
  screens?: 1 | 2;
  children: ReactNode;
}) {
  const classes = ["section", `section-${ground}`, className ?? ""];
  // A custom property is not in CSSProperties' keys; the cast only names it, the value is a plain number.
  const style = screens === 2 ? ({ "--h": 2 } as CSSProperties) : undefined;
  return (
    <section
      id={id}
      className={classes.filter(Boolean).join(" ")}
      style={style}
      aria-labelledby={labelledBy}
      data-moment={moment || undefined}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}
