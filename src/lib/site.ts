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

/**
 * Reviews as published at LIVE_AIMS.home (checked 22 Nov 2026): verbatim sentences, "…" marks a cut, and
 * each review is shown there with five stars and the place below the name. `photo` stays empty until AIMS
 * supplies the reviewer's own photo with consent; a stock photo must never stand in for a named customer
 * (CLAUDE.md §1 and §2, Imagery).
 */
export type CustomerReview = {
  name: string;
  place: string;
  rating: number;
  excerpt: string;
  photo?: { src: string; width: number; height: number };
};
export const CUSTOMER_REVIEWS: readonly CustomerReview[] = [
  {
    name: "Sneha Paul",
    place: "Dubai, UAE",
    rating: 5,
    excerpt: "Their sales team is kind and ready to help any time.",
  },
  {
    name: "Traffic Burger Head Office",
    place: "Abu Dhabi, UAE",
    rating: 5,
    excerpt: "…staff is very cooperative and all the time available to help you out.",
  },
  {
    name: "Arjun",
    place: "Oman",
    rating: 5,
    excerpt: "They are very professional … I am very happy with their service.",
  },
];

export const COMPANY_NAME = "AIMS Security Systems Trading LLC";
