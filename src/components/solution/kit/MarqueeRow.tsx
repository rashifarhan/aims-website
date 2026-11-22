type Props = { label: string; words: string[] };

/**
 * The dealt `marquee-row` moment (skill moments.md): real words from the catalogue move slowly
 * sideways in a loop, pause under the pointer, and carry a pause button the moment builds. Under
 * reduced motion and without script they stand in a wrapped row.
 */
export function MarqueeRow({ label, words }: Props) {
  return (
    <div data-moment="marquee-row" data-moment-opts='{"speed": 36}' role="group" aria-label={label}>
      <ul className="mo-mq__track">
        {words.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
