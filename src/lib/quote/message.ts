import type { QuoteContext } from "./context";
import type { QuoteLine } from "./store";

/**
 * Builds the text AIMS receives (WhatsApp draft and enquiry summary). The
 * caller supplies localised labels, so the builder stays pure and testable
 * (Plan ch. 16: "WhatsApp message builder", AT-02).
 */
export type MessageLabels = {
  greeting: string; // "Hi AIMS, quote request (ref {ref}):"
  custom: string; // "Not listed: {text}"
  need: string;
  timing: string;
  buyer: string;
  name: string;
  replyBy: string;
  needs: Record<string, string>;
  timings: Record<string, string>;
  buyers: Record<string, string>;
  emirates: Record<string, string>;
  siteTypes: Record<string, string>;
  replyChannels: Record<string, string>;
  doors: string; // "{n} doors"
  users: string; // "{n} users"
  existing: string; // "existing: {text}"
  documents: string; // "documents: {text}"
};

export type ProductRef = { name: string; model: string };

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (m, k: string) => v[k] ?? m);
const join = (parts: (string | undefined | false)[]) => parts.filter(Boolean).join(" · ");

export function buildQuoteMessage(input: {
  reference: string;
  lines: QuoteLine[];
  products: Record<string, ProductRef>;
  context: QuoteContext;
  contact?: { name?: string; company?: string; replyBy?: string };
  labels: MessageLabels;
}): string {
  const { reference, lines, products, context: c, contact, labels: L } = input;
  const out: string[] = [fill(L.greeting, { ref: reference })];

  for (const line of lines) {
    if (line.kind === "product") {
      const p = products[line.slug];
      out.push(`• ${p ? `${p.name} (${p.model})` : line.slug} × ${line.qty}`);
    } else {
      out.push(`• ${fill(L.custom, { text: line.text })} × ${line.qty}`);
    }
  }

  if (c.need) {
    const place =
      c.need === "supply"
        ? c.city?.trim()
        : c.need === "install"
          ? join([
              c.emirate && L.emirates[c.emirate],
              c.siteType && L.siteTypes[c.siteType],
              c.doors?.trim() && fill(L.doors, { n: c.doors.trim() }),
              c.users?.trim() && fill(L.users, { n: c.users.trim() }),
              c.existing?.trim() && fill(L.existing, { text: c.existing.trim() }),
            ])
          : join([
              c.country?.trim(),
              c.port?.trim(),
              c.documents?.trim() && fill(L.documents, { text: c.documents.trim() }),
            ]);
    out.push(`${L.need}: ${join([L.needs[c.need], place])}`);
  }
  if (c.timing) out.push(`${L.timing}: ${L.timings[c.timing]}`);
  if (c.buyerType || contact?.company?.trim())
    out.push(`${L.buyer}: ${join([c.buyerType && L.buyers[c.buyerType], contact?.company?.trim()])}`);
  if (contact?.name?.trim()) out.push(`${L.name}: ${contact.name.trim()}`);
  if (contact?.replyBy) out.push(`${L.replyBy}: ${L.replyChannels[contact.replyBy]}`);
  return out.join("\n");
}

/** "Q-2611-4821": year+month and four digits, enough to find the thread. */
export function makeReference(now = new Date(), random = Math.random): string {
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `Q-${yymm}-${String(Math.floor(random() * 10000)).padStart(4, "0")}`;
}
