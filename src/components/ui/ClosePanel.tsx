import { isValidElement, type ReactElement } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Section } from "./Section";

type Action = { href: string; label: string };

/**
 * The one closing panel (design-taste-frontend one system; Design Doc 2, principle 1): a heading, one
 * line of body, one main action and at most one link. `mint` sits as a panel on paper; `night` is the
 * full-bleed night-green band where lime carries the action (≥ 4.5:1, globals.css). The action is a
 * link, or a ready element when it does more than navigate (software's add-to-quote button). `embedded` renders
 * the mint panel as the last block of another section's screen (the solution and location questions), with no
 * section ground of its own: alone, the close filled a fifth of a desktop screen (taste House rule 3; audit T-01).
 */
export function ClosePanel({
  id,
  tone = "mint",
  heading,
  body,
  action,
  secondary,
  embedded = false,
}: {
  id: string;
  tone?: "mint" | "night";
  heading: string;
  body: string;
  action: Action | ReactElement;
  secondary?: Action;
  embedded?: boolean;
}) {
  const night = tone === "night";
  const panel = (
      <div className="ui-close-panel">
        <div className="ui-close-copy">
          <h2 id={id} className="ui-close-title">
            {heading}
          </h2>
          <p className="ui-close-body">{body}</p>
        </div>
        <div className="ui-close-actions">
          {isValidElement(action) ? (
            action
          ) : (
            <Link href={action.href} className={night ? "home-button home-button-lime" : "home-button"}>
              {action.label}
              <ArrowIcon width="18" height="18" className="home-action-arrow" />
            </Link>
          )}
          {secondary && (
            <Link href={secondary.href} className={night ? "home-night-link" : "home-text-link"}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
  );
  if (embedded)
    return (
      <section className="ui-close-mint ui-close-embedded" aria-labelledby={id}>
        {panel}
      </section>
    );
  return (
    <Section
      ground={night ? "night" : "paper"}
      labelledBy={id}
      className={night ? "ui-close ui-close-night" : "ui-close ui-close-mint"}
    >
      {panel}
    </Section>
  );
}
