/**
 * Site-wide settings. Indexing is OFF unless SITE_INDEXABLE=true, so
 * previews never compete with the live aimsuae.me in search (Plan ch. 16).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aimsuae.me").replace(/\/$/, "");
export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

/**
 * WhatsApp, phone and email links reach AIMS's real sales lines only when
 * this is "true" (production). Everywhere else they open a preview notice
 * first (Plan risk R5: "Demo contacts AIMS's real sales line").
 */
export const LIVE_CONTACT = process.env.NEXT_PUBLIC_LIVE_CONTACT === "true";

/**
 * Show "Authorized ZKTeco Distributor" only once AIMS confirms it (Design
 * Doc 3.1 claims policy). Until then the interim line is used.
 */
// Confirmed by AIMS via the client on 21 Nov 2026; wording "Authorized ZKTeco Distributor · UAE" approved the same day.
export const ZKTECO_AUTHORIZATION_CONFIRMED = true;

/**
 * Company figures AIMS confirmed on 21 Nov 2026 as published on aimsuae.me. Shown only as
 * company-stated (Design Doc 3.1); the founding year stays off the site until AIMS supplies it.
 */
export const COMPANY_FIGURES = [
  { key: "years", value: 11, suffix: "+" },
  { key: "installations", value: 2200, suffix: "+" },
  { key: "clients", value: 200, suffix: "+" },
  { key: "countries", value: 30, suffix: "+" },
] as const;

/**
 * Contact details exactly as labelled in the aimsuae.me footer. Opening
 * hours and map links for the head office and Abu Dhabi are not published
 * yet (open question for AIMS).
 */
export const CONTACT = {
  whatsapp: "971565240495",
  email: "info@aimsuae.me",
  lines: {
    headOffice: { tel: "+97142523253", display: "+971 4 252 3253" },
    showroom: { tel: "+97148808445", display: "+971 4 880 8445" },
    abuDhabi: { tel: "+97125466047", display: "+971 2 546 6047" },
    mobile: { tel: "+971565240495", display: "+971 56 524 0495" },
  },
  showroomAddress: "Showroom #14, Naif Bazar Building, Deira, Dubai",
  showroomMap: "https://maps.app.goo.gl/JJvK9uCbyHMoK4J1A",
} as const;

/** The three published places to visit or call: head office, Deira showroom, Abu Dhabi office. */
export const LOCATION_LINES = ["headOffice", "showroom", "abuDhabi"] as const;

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** Homepage fallbacks until the corresponding local routes are built (Design Doc T1). */
export const LIVE_AIMS = {
  home: "https://aimsuae.me/",
  contact: "https://aimsuae.me/enquiry",
  software: "https://aimsuae.me/swcategory/zk-teco",
} as const;

/** Short, verbatim excerpts; names as published at LIVE_AIMS.home, checked 21 Nov 2026. */
export const CUSTOMER_REVIEWS = [
  { name: "Sneha Paul", excerpt: "Their sales team is kind" },
  { name: "Traffic Burger Head Office", excerpt: "staff is very cooperative" },
  { name: "Arjun", excerpt: "very professional" },
] as const;

export const COMPANY_NAME = "AIMS Security Systems Trading LLC";
