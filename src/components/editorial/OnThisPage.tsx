import { ChevronDownIcon } from "@/components/icons";

type Item = { id: string; text: string };
type Props = { labels: { wide: string; narrow: string }; items: Item[]; lang?: "en" };

function Links({ items, lang }: { items: Item[]; lang?: "en" }) {
  return (
    <ol lang={lang} dir={lang ? "ltr" : undefined}>
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  );
}

/**
 * The in-page index (Design Doc 10.1: "680 px column + in-page index"; the index becomes "Jump to" on
 * phones). Desktop shows a sticky list beside the column; phones get a closed native disclosure, so a
 * long policy does not open with a screen of links. Only one of the two is ever displayed.
 */
export function OnThisPage({ labels, items, lang }: Props) {
  return (
    <div className="ed-index-slot">
      <nav aria-label={labels.wide} className="ed-index ed-index-wide">
        <p className="ed-index-title">{labels.wide}</p>
        <Links items={items} lang={lang} />
      </nav>
      <details className="ed-index ed-index-narrow">
        <summary>
          {labels.narrow}
          <ChevronDownIcon width={16} height={16} aria-hidden="true" />
        </summary>
        <nav aria-label={labels.narrow}>
          <Links items={items} lang={lang} />
        </nav>
      </details>
    </div>
  );
}
