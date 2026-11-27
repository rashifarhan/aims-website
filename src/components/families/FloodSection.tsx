import type { CSSProperties, ReactNode } from "react";
import "./flood.css";

export type FloodTone = "chalk" | "access" | "time" | "entry" | "locks" | "parts" | "pos";

/**
 * A reading section of direction 3 (CLAUDE.md → Design rules → Layout): full bleed on the warm chalk ground or on a
 * family's ground, content in the one `wrap`. On a ground, `flood` turns the primary button white.
 */
export function FloodSection({
  id,
  tone,
  labelledBy,
  className = "",
  children,
}: {
  id: string;
  tone: FloodTone;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ground = tone === "chalk" ? undefined : ({ "--ground": `var(--color-ground-${tone})` } as CSSProperties);
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`flood-section ${tone === "chalk" ? "flood-chalk" : "flood flood-ground"} ${className}`}
      style={ground}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}
