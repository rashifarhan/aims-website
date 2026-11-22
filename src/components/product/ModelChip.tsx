/**
 * The model code as a small mono pill (Design Doc 5: model codes in IBM Plex Mono). Always LTR inside
 * Arabic text (CLAUDE.md 7). The "How it connects" diagram uses the large one as its source node.
 */
export function ModelChip({ model, size = "sm" }: { model: string; size?: "sm" | "lg" }) {
  const look =
    size === "lg"
      ? "border-green-700 bg-green-50 px-4 py-2 text-base font-semibold text-green-800"
      : "border-line-strong bg-paper-2 px-3 py-1 text-sm text-ink-700";
  return (
    <span
      dir="ltr"
      translate="no"
      className={`inline-flex max-w-full items-center rounded-pill border font-mono wrap-anywhere ${look}`}
    >
      {model}
    </span>
  );
}
