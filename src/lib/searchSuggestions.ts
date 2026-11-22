export type SearchEntry = { label: string; href: string; kind: "product" | "software" | "solution"; keywords: string };

/** Small local index: model/name matches outrank category matches; no remote search requests. */
export function searchSuggestions(entries: SearchEntry[], query: string): SearchEntry[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries
    .map((entry, index) => {
      const label = entry.label.toLocaleLowerCase();
      const haystack = `${label} ${entry.keywords.toLocaleLowerCase()}`;
      const score = words.every((word) => haystack.includes(word))
        ? words.reduce(
            (sum, word) => sum + (label === word ? 8 : label.startsWith(word) ? 4 : label.includes(word) ? 2 : 1),
            0,
          )
        : 0;
      return { entry, score, index };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 6)
    .map(({ entry }) => entry);
}

export function highlightMatches(label: string, query: string) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return [{ text: label, match: false }];
  const expression = new RegExp(`(${words.join("|")})`, "i");
  return label
    .split(expression)
    .filter(Boolean)
    .map((text) => ({ text, match: expression.test(text) }));
}
