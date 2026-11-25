import { isValidElement, type ReactElement } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Magnetic } from "./Magnetic";
import { Section } from "./Section";
import { Ridges } from "./Ridges";

type Action = { href: string; label: string };

/**
 * The one closing panel (design-taste-frontend one system; Design Doc 2, principle 1): a heading, one line of body,
 * one main action and at most one link. Premium pass (client decisions, 24 Nov 2026): a full-width night-green band,
 * centred over the ridge motif, with the inverted signature button, so the page's last ask reads as its most
 * important. The action is a link, or a ready element when it does more than navigate (software's add-to-quote
 * button). `embedded` renders the mint panel as the last block of another section's screen (the solution and
 * location questions), with no section ground of its own (taste House rule 3; audit T-01).
 */
export function ClosePanel({
  id,
  heading,
  body,
  action,
  secondary,
  embedded = false,
}: {
  id: string;
  heading: string;
  body: string;
  action: Action | ReactElement;
  secondary?: Action;
  embedded?: boolean;
}) {
  const panel = (
    <div className="ui-close-panel">
      <div className="ui-close-copy">
        <h2 id={id} className="ui-close-title" data-heading-reveal={!embedded || undefined}>
          {heading}
        </h2>
        <p className="ui-close-body">{body}</p>
      </div>
      <div className="ui-close-actions">
        {isValidElement(action) ? (
          action
        ) : (
          <Magnetic>
            <Link href={action.href} className="home-button">
              {action.label}
              <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
            </Link>
          </Magnetic>
        )}
        {secondary && (
          <Link href={secondary.href} className={embedded ? "home-text-link" : "home-secondary"}>
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
    <Section ground="night" labelledBy={id} className="ui-close">
      <Ridges className="close-ridges" />
      {panel}
    </Section>
  );
}
