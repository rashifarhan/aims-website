/**
 * The journey's words. Every figure is AIMS's catalogue's (content/products.json, content/software.json); the
 * role lines say what each product does without claiming more than its catalogue entry does. AIMS's company
 * lines follow the site's approved copy ("supplied, installed and supported across the UAE") and its confirmed
 * authorization wording (src/lib/site.ts, ZKTECO_AUTHORIZATION_CONFIRMED).
 */

export const AUTHORIZED = "Authorized ZKTeco Distributor · UAE";

export type ChapterCopy = { number: string; title: string; line: string };

/** Each chapter opens by saying what AIMS does in that part of a building (AIMS's own search topics). */
export const CHAPTER_COPY: Record<string, ChapterCopy> = {
  parking: {
    number: "01",
    title: "Parking",
    line: "AIMS supplies, installs and supports ZKTeco parking barriers and long-range vehicle readers across the UAE.",
  },
  lobby: {
    number: "02",
    title: "Lobby security",
    line: "Security gates, turnstiles and walk-through metal detectors, supplied and installed by AIMS.",
  },
  office: {
    number: "03",
    title: "Door access",
    line: "Face recognition terminals, locks and the door hardware around them: AIMS fits the whole door.",
  },
  clockin: {
    number: "04",
    title: "Attendance",
    line: "Face recognition attendance and BioTime software, set up and integrated by AIMS.",
  },
};

export type Spec = { label: string; value: string };
export type ProductCopy = { role: string; specs: Spec[] };

/** Per beat (journey.PRODUCTS keys): one line on its job and three catalogue facts. */
export const PRODUCT_COPY: Record<string, ProductCopy> = {
  UHF10: {
    role: "Reads a vehicle's UHF tag at the gate and signals the barrier.",
    specs: [
      { label: "Read range", value: "Up to 10 m" },
      { label: "Frequency", value: "865–868 / 902–928 MHz" },
      { label: "Output", value: "Wiegand / RS485" },
    ],
  },
  "BGM-1030": {
    role: "A compact boom barrier for car park and site entrances.",
    specs: [
      { label: "Boom", value: "3 m, straight" },
      { label: "Opens in", value: "About 1.5 s" },
      { label: "Chassis", value: "350 × 280 × 1000 mm" },
    ],
  },
  "ZK-D3180S": {
    role: "A walk-through metal detector for lobbies and entrances.",
    specs: [
      { label: "Detection zones", value: "18" },
      { label: "Sensitivity levels", value: "256" },
      { label: "Passage", value: "1990 × 700 mm" },
    ],
  },
  "MARS-B1200": {
    role: "Swing barrier gates that open for the right people in busy lobbies.",
    specs: [
      { label: "Type", value: "Dual-lane swing barrier" },
      { label: "Flaps", value: "Acrylic (stainless steel or glass optional)" },
      { label: "Weight", value: "61 kg" },
    ],
  },
  "ProFace X": {
    role: "An outdoor, vandal-resistant face recognition terminal for doors.",
    specs: [
      { label: "Faces", value: "30,000 (50,000 optional)" },
      { label: "Users / cards", value: "50,000" },
      { label: "Size", value: "227 × 143 × 26 mm" },
    ],
  },
  "ALF-M560": {
    role: "An electromagnetic lock that holds the door until access is granted.",
    specs: [
      { label: "Outward doors", value: "Adjustable L bracket" },
      { label: "Inward doors", value: "Adjustable ZL bracket" },
    ],
  },
  "SpeedFace V5L": {
    role: "Face, palm and fingerprint attendance at the door.",
    specs: [
      { label: "Face recognition", value: "≤1 s" },
      { label: "Faces / palms", value: "6,000 / 3,000" },
      { label: "Display", value: "5-inch touch screen" },
    ],
  },
  "BioTime 9.5": {
    role: "Time attendance and workforce software: every punch, live.",
    specs: [
      { label: "Check-ins", value: "Real-time sync" },
      { label: "Scheduling", value: "Shifts, overtime, leave" },
      { label: "Reports", value: "In a few clicks" },
    ],
  },
};

/** Software a product's own catalogue entry lists as supported, with the software page that exists for it. */
export const WORKS_WITH: Record<string, { label: string; slug: string }[]> = {
  "SpeedFace V5L": [{ label: "Works with BioTime 8.5", slug: "biotime-8-5" }],
};

/**
 * Where in its beat each product's checkpoint holds (fraction of the beat): on the close-up with the card fully
 * formed, after the device has done its job (the boom up, the zones lit, the flaps open, the match shown).
 */
export const STOP_AT: Record<string, number> = { "BGM-1030": 0.8 };
export const stopFrame = (key: string, from: number, to: number) => Math.round(from + (to - from) * (STOP_AT[key] ?? 0.6));
