/**
 * Copy each shared T3 section takes (see src/content/solutionPages.ts for the template API). A page's
 * i18n namespace provides these shapes; structural typing lets it pass its sub-objects directly.
 */
export type SectionCopy = { heading: string; lead: string };
/** `secondary` takes {count}: the family's product count, the hero's one hard fact. */
export type IntroCopy = { eyebrow: string; title: string; lead: string; primary: string; secondary: string };
/** `count` takes {count}; `items` holds a title and body per method key. */
export type MethodsCopy<K extends string> = SectionCopy & {
  count: string;
  countOne: string;
  items: Record<K, { title: string; body: string }>;
};
/** `all` takes {count}; `methods` is the screen-reader label of the verification line. */
export type ProductsCopy = SectionCopy & { all: string; methods: string };
export type ProcessCopy = SectionCopy & {
  owner: string;
  steps: readonly { title: string; body: string; owner: string }[];
};
export type FaqCopy = { heading: string; items: readonly { q: string; a: string }[] };
/** One option card: `icon` is a path on the 32px explainer grid (optionIcons.ts), `count` a ready label. */
export type OptionItem = { key: string; icon: string; title: string; body: string; href: string; count: string };
