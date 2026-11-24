import { Fragment, type CSSProperties } from "react";

/**
 * A heading's words, each in its own clipping box, so the scroll reveal (ui/reveal.css) can raise them one after
 * another as the heading enters (client decision 7, 24 Nov 2026). The words stay one text run for assistive
 * technology: the spans carry no semantics, and the spaces between them are real text. Without scroll-timeline
 * support, or under reduced motion, the words simply stand.
 */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className="split-words">
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && " "}
          <span className="split-word">
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}
