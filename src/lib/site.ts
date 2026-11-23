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
 * Contact details exactly as published on aimsuae.me (footer and the
 * "Our Branches" block on /enquiry). Opening hours are not published yet
 * (open question for AIMS), so the site never states them.
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

/**
 * Delivery markets as AIMS lists them (PRODUCT.md "Markets", Master Plan ch. 11): places AIMS supplies from Dubai,
 * not offices. Oman and Kenya have their own pages on aimsuae.me; the others start an export quote.
 */
export const DELIVERY_MARKETS = {
  gcc: ["Oman", "Bahrain", "Kuwait"],
  africa: ["Kenya", "Tanzania", "Cameroon", "Nigeria", "Uganda"],
} as const;
export const DELIVERY_COUNTRIES = [...DELIVERY_MARKETS.gcc, ...DELIVERY_MARKETS.africa] as const;
export type DeliveryMarket = (typeof DELIVERY_COUNTRIES)[number];

export const whatsappUrl = (text?: string, number: string = CONTACT.whatsapp) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

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

export type LocationId = "headOffice" | "showroom" | "abuDhabi";

/**
 * AIMS's own photograph of its Deira showroom: open question for AIMS (README, Not yet confirmed). Until AIMS
 * supplies one it stays null and nothing renders. No stand-in: on AIMS's own pages a stock photo would read as its
 * premises (CLAUDE.md §1). To add it, save the file under public/images/showroom/ and set its path and size here;
 * the showroom card on /contact and /about then shows it.
 */
export const SHOWROOM_PHOTO: { src: string; width: number; height: number } | null = null;

/**
 * The three branches as listed on aimsuae.me/enquiry ("Our Branches"),
 * with the address shown there or in AIMS's own directions link. Map
 * links open Google Maps; the site embeds no map (no third-party requests
 * at runtime, CLAUDE.md §5).
 */
export const LOCATIONS: { id: LocationId; address: string; line: keyof typeof CONTACT.lines; map: string }[] = [
  { id: "headOffice", address: "Deira, Dubai", line: "headOffice", map: "https://maps.app.goo.gl/hnfo29MVNtrfCaUm7" },
  { id: "showroom", address: CONTACT.showroomAddress, line: "showroom", map: CONTACT.showroomMap },
  {
    id: "abuDhabi",
    address: "Electra Street, Al Danah, Zone 1, Abu Dhabi",
    line: "abuDhabi",
    map: "https://maps.app.goo.gl/3G5TbnFs5Xpysr648",
  },
];

/**
 * Which channel serves which need, from AIMS's own buttons: product
 * "Order Now" and the site-wide chat use the mobile line; every software
 * "Download" button opens WhatsApp to the Dubai showroom line. AIMS
 * publishes no separate support line, so none is invented.
 */
export const NEED_CHANNELS = {
  sales: CONTACT.lines.mobile,
  software: CONTACT.lines.showroom,
  visit: CONTACT.lines.showroom,
  export: CONTACT.lines.mobile,
} as const;
export type ContactNeed = keyof typeof NEED_CHANNELS;
