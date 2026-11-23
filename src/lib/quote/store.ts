import { z } from "zod";
import { presetPatch, QuoteContextSchema, type QuoteContext } from "./context";

/**
 * The quote list (Plan ch. 13/16): one store, persisted to localStorage
 * under "aims.quote.v1" with a 14-day TTL, shared across tabs. Pure
 * reducer + a tiny external store for useSyncExternalStore.
 */
export const QUOTE_KEY = "aims.quote.v1";
export const QUOTE_EVENT = "aims:quote-change";
export const QUOTE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const MAX_QTY = 9999;

const ProductLine = z.object({
  kind: z.literal("product"),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  qty: z.number().int(),
});
const CustomLine = z.object({
  kind: z.literal("custom"),
  id: z.string(),
  text: z.string().max(200),
  qty: z.number().int(),
});
const QuoteSchema = z.object({
  v: z.literal(1),
  updatedAt: z.number(),
  lines: z.array(z.discriminatedUnion("kind", [ProductLine, CustomLine])),
  context: QuoteContextSchema.optional(),
});

export type QuoteLine = z.infer<typeof ProductLine> | z.infer<typeof CustomLine>;
export type QuoteState = z.infer<typeof QuoteSchema>;

export type QuoteAction =
  | { type: "add"; slug: string; qty: number; preset?: Partial<QuoteContext> }
  | { type: "requestSoftware"; slug: string; text: string }
  | { type: "addCustom"; id: string; text: string; qty: number; preset?: Partial<QuoteContext> }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  /** Undo a removal (Design Doc 9: removed line, undo 5 s). */
  | { type: "restore"; line: QuoteLine; index: number }
  | { type: "setContext"; patch: Partial<QuoteContext> }
  | { type: "clear" };

export const EMPTY_QUOTE: QuoteState = { v: 1, updatedAt: 0, lines: [] };

// Named platform requests already use these IDs in saved v1 baskets.
export const isSoftwareLine = (line: QuoteLine) => line.kind === "custom" && line.id.startsWith("software-");

export const lineKey = (l: QuoteLine) => (l.kind === "product" ? l.slug : l.id);
const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(Number.isFinite(n) ? n : 1)));

export function quoteReducer(state: QuoteState, action: QuoteAction, now = Date.now()): QuoteState {
  const next = (lines: QuoteLine[]): QuoteState => {
    const preset =
      action.type === "add" || action.type === "addCustom" ? presetPatch(state.context, action.preset) : undefined;
    return { ...state, ...(preset && { context: { ...state.context, ...preset } }), v: 1, updatedAt: now, lines };
  };
  switch (action.type) {
    case "add": {
      const existing = state.lines.find((l) => l.kind === "product" && l.slug === action.slug);
      if (existing) {
        // Adding again increases the quantity rather than duplicating the line.
        return next(state.lines.map((l) => (l === existing ? { ...l, qty: clampQty(l.qty + action.qty) } : l)));
      }
      return next([...state.lines, { kind: "product", slug: action.slug, qty: clampQty(action.qty) }]);
    }
    case "requestSoftware": {
      const id = `software-${action.slug}`;
      const text = action.text.trim().slice(0, 200);
      if (!text) return state;
      const lines = state.lines.some((line) => lineKey(line) === id)
        ? state.lines
        : [...state.lines, { kind: "custom" as const, id, text, qty: 1 }];
      return { ...next(lines), context: { ...state.context, need: state.context?.need ?? "software" } };
    }
    case "addCustom": {
      const text = action.text.trim().slice(0, 200);
      if (!text) return state;
      return next([...state.lines, { kind: "custom", id: action.id, text, qty: clampQty(action.qty) }]);
    }
    case "setQty":
      return next(state.lines.map((l) => (lineKey(l) === action.key ? { ...l, qty: clampQty(action.qty) } : l)));
    case "remove":
      return next(state.lines.filter((l) => lineKey(l) !== action.key));
    case "restore": {
      if (state.lines.some((l) => lineKey(l) === lineKey(action.line))) return state;
      const lines = [...state.lines];
      lines.splice(Math.min(Math.max(0, action.index), lines.length), 0, action.line);
      return next(lines);
    }
    case "setContext":
      return { ...state, updatedAt: now, context: { ...state.context, ...action.patch } };
    case "clear":
      return { v: 1, updatedAt: now, lines: [] };
  }
}

/** Parse stored JSON; anything invalid or expired becomes an empty quote. */
export function parseStored(raw: string | null, now = Date.now()): QuoteState {
  if (!raw) return EMPTY_QUOTE;
  try {
    const parsed = QuoteSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || now - parsed.data.updatedAt > QUOTE_TTL_MS) return EMPTY_QUOTE;
    return parsed.data;
  } catch {
    return EMPTY_QUOTE;
  }
}

/* ---------- external store (client only) ---------- */

let cache: { raw: string | null; state: QuoteState } | null = null;

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(QUOTE_KEY);
  } catch {
    return null; // storage blocked (private mode): the quote lives in memory only
  }
}

let memoryFallback: string | null = null;

export function getQuote(): QuoteState {
  const raw = readStorage() ?? memoryFallback;
  if (!cache || cache.raw !== raw) cache = { raw, state: parseStored(raw) };
  return cache.state;
}

export const getServerQuote = () => EMPTY_QUOTE;

export function dispatchQuote(action: QuoteAction): QuoteState {
  const state = quoteReducer(getQuote(), action);
  const raw = JSON.stringify(state);
  try {
    window.localStorage.setItem(QUOTE_KEY, raw);
  } catch {
    memoryFallback = raw;
  }
  window.dispatchEvent(new Event(QUOTE_EVENT));
  return state;
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
