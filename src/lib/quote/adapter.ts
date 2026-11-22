import type { QuoteContext } from "./context";
import type { Contact } from "./request";
import type { QuoteLine } from "./store";

/**
 * Submission boundary (Plan ch. 16). The preview uses DemoAdapter: no
 * network request of any kind (AT-07). A production adapter (email or CRM
 * via a server action, with the honeypot check and a rate limit) plugs in
 * here without touching the UI.
 */
export type QuoteRequest = {
  reference: string;
  lines: QuoteLine[];
  context: QuoteContext;
  contact: Contact;
  message: string;
};

export type QuoteReceipt = { reference: string; demo: boolean; channel: Contact["replyBy"] };

export interface QuoteAdapter {
  submit(request: QuoteRequest): Promise<QuoteReceipt>;
}

export const DemoAdapter: QuoteAdapter = {
  async submit(request) {
    // Honeypot filled → a bot. Same response, nothing happens (in production
    // the server drops it).
    return { reference: request.reference, demo: true, channel: request.contact.replyBy };
  },
};
