type Props = { message: string; reference: string; className?: string };

/**
 * The message as AIMS receives it. Each line takes its own direction (unicode-bidi: plaintext), so an
 * Arabic line reads right to left and a model line such as "ZKTeco F18 (F18) × 1" left to right, in the
 * page's own face (Inter, or Plex Sans Arabic on /ar; Design Doc 13), not the pre's default monospace
 * (quote.css). Only the reference is mono, and it never breaks across lines.
 */
export function MessagePreview({ message, reference, className = "" }: Props) {
  const at = reference ? message.indexOf(reference) : -1;
  return (
    <pre
      aria-live="off"
      className={`message-preview overflow-auto rounded-md bg-green-50 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-ink ${className}`}
    >
      {at < 0 ? (
        message
      ) : (
        <>
          {message.slice(0, at)}
          <bdi dir="ltr" className="font-mono whitespace-nowrap">
            {reference}
          </bdi>
          {message.slice(at + reference.length)}
        </>
      )}
    </pre>
  );
}
