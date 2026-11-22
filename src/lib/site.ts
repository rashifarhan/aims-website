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
export const ZKTECO_AUTHORIZATION_CONFIRMED = false;

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

export const whatsappUrl = (text?: string, number: string = CONTACT.whatsapp) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export type LocationId = "headOffice" | "showroom" | "abuDhabi";

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
