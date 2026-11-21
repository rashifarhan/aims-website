/**
 * Minimal read side of the quote list (localStorage "aims.quote.v1",
 * 14-day TTL: Plan ch. 13). The full reducer/store lands with the quote
 * page; the header only needs the item count.
 */
export const QUOTE_KEY = "aims.quote.v1";
export const QUOTE_EVENT = "aims:quote-change";
const TTL_MS = 14 * 24 * 60 * 60 * 1000;

type Stored = { v: 1; updatedAt: number; lines: { slug: string; qty: number }[] };

export function readQuoteCount(): number {
  try {
    const raw = window.localStorage.getItem(QUOTE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as Stored;
    if (data.v !== 1 || Date.now() - data.updatedAt > TTL_MS) return 0;
    return Array.isArray(data.lines) ? data.lines.length : 0;
  } catch {
    return 0; // storage blocked (private mode) or corrupt: treat as empty
  }
}

export function subscribeQuote(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => e.key === QUOTE_KEY && onChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(QUOTE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(QUOTE_EVENT, onChange);
  };
}
