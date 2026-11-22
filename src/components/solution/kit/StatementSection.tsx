type Props = { id: string; heading: string; text: string; strong: string };

/**
 * A statement section for the dealt `word-highlight` moment (skill moments.md): one statement of
 * 12 to 40 words turns from grey to ink word by word as it crosses the screen's middle; its one
 * <strong> phrase turns to the accent. The words are in the HTML, in ink, without script.
 * `text` holds "{turnstile}" where the strong phrase goes.
 */
export function StatementSection({ id, heading, text, strong }: Props) {
  const [before, after = ""] = text.split("{turnstile}");
  return (
    <section className="section" id={id} aria-labelledby={`${id}-h`} data-moment="word-highlight">
      <div className="wrap">
        <h2 id={`${id}-h`}>{heading}</h2>
        {/* The moment splits the words into hidden spans and names this element with the whole
            statement (aria-label), which ARIA allows on a group, not on a plain paragraph. */}
        <p className="mo-wh__text" role="group">
          {before}
          <strong>{strong}</strong>
          {after}
        </p>
      </div>
    </section>
  );
}
