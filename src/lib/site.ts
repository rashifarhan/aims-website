/**
 * Site-wide settings. Indexing is OFF unless SITE_INDEXABLE=true, so
 * previews never compete with the live aimsuae.me in search (Plan ch. 16).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aimsuae.me").replace(/\/$/, "");
export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

/**
 * Contact details as published on aimsuae.me. Which number serves which
 * need is an open question for AIMS (Design Doc ch. 17).
 */
export const CONTACT = {
  whatsapp: "971565240495",
  phone: "+97148808445",
  email: "info@aimsuae.me",
} as const;
