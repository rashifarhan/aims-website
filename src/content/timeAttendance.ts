import "server-only";
import type { Method } from "./schema";

/**
 * T3 time attendance (Master Plan 12 #15). Six terminals chosen so every check-in method is
 * covered by a model with structured specs; an editorial choice, not stock or sales data.
 */
export const TA_PRODUCTS = ["biopro-mh20", "sface-lite", "iface-990", "zk-x990-c", "ua760", "zkteco-horus-h1"] as const;

/** Method guide order; "mobile" also counts QR, since both are phone credentials (Design Doc 10, T3). */
export const TA_METHODS = [
  { key: "face", match: ["face"] },
  { key: "fingerprint", match: ["fingerprint"] },
  { key: "card", match: ["card"] },
  { key: "mobile", match: ["mobile", "qr"] },
] as const satisfies readonly { key: string; match: readonly Method[] }[];

export const TA_SOFTWARE = [
  { slug: "biotime-9-5", kind: "onPremise", purpose: "purposeOnPremise" },
  { slug: "biotimecloud", kind: "cloud", purpose: "purposeCloud" },
  { slug: "zkbiotime-mobile-app", kind: "mobile", purpose: "purposeMobile" },
] as const;
