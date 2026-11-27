import { isValidElement, type ReactElement } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Magnetic } from "./Magnetic";
import { Section } from "./Section";
import { GiantWord } from "@/components/families/GiantWord";
import { QUOTE_WORD } from "@/components/families/familyShowcase";

type Action = { href: string; label: string };

/**
 * The one closing panel (design-taste-frontend one system; Design Doc 2, principle 1): a heading, one line of body,
 * one main action and at most one link. Premium pass (client decisions, 24 Nov 2026): a full-width night-green band,
 * centred over the ridge motif, with the inverted signature button, so the page's last ask reads as its most
 * important. The action is a link, or a ready element when it does more than navigate (software's add-to-quote
 * button). Every page that closes with an ask uses this band, the solution and location pages included (client
 * request, 25 Nov 2026: their small mint panel read as a weaker, different ending).
 */
export function ClosePanel({
  id,
  heading,
  body,
  action,
  secondary,
}: {
  id: string;
  heading: string;
  body: string;
  action: Action | ReactElement;
  secondary?: Action;
}) {
  const panel = (
    <div className="ui-close-panel">
      <div className="ui-close-copy">
        <h2 id={id} className="ui-close-title" data-heading-reveal>
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
          <Link href={secondary.href} className="home-secondary">
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
  return (
    <Section ground="night" labelledBy={id} className="ui-close">
      {/* Direction 3's closing flood: the giant QUOTE along the band's foot (ui/d3-sections.css). */}
      <GiantWord word={QUOTE_WORD.word} em={QUOTE_WORD.wordEm} className="ui-close-word" />
      {panel}
    </Section>
  );
}
