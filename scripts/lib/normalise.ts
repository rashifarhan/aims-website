/**
 * Pure normalisation helpers for the aimsuae.me import. Unit-tested in
 * scripts/lib/normalise.test.ts. No network or file access here.
 */
import type { Block, Connectivity, Method, SpecGroup, SpecRow } from "../../src/content/schema";

/* ---------- text ---------- */

export function cleanText(s: string): string {
  return s
    .replace(/ /g, " ")
    .replace(/[ \t\r\n]+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

/** Drops a trailing ":" and collapses whitespace. */
function tidyLabel(s: string): string {
  return cleanText(s).replace(/:$/, "").trim();
}

/* ---------- spec labels ---------- */

/**
 * Canonical labels for spellings that vary across AIMS product pages.
 * Keys are lower-cased, with spaces and punctuation removed.
 */
const LABEL_MAP: Record<string, string> = {
  dimension: "Dimensions",
  dimensions: "Dimensions",
  dimensionsmm: "Dimensions",
  dimensionwxdxh: "Dimensions (W × D × H)",
  dimensionswxdxh: "Dimensions (W × D × H)",
  dimensionlxwxh: "Dimensions (L × W × H)",
  dimensionslxwxh: "Dimensions (L × W × H)",
  dimensionswxhxt: "Dimensions (W × H × T)",
  packagedimension: "Package dimensions",
  dimensionwithpackingmm: "Package dimensions",
  weight: "Weight",
  netweight: "Weight",
  netweightkg: "Weight",
  packageweight: "Package weight",
  weightwithpackingkg: "Package weight",
  operatingtemperature: "Operating temperature",
  workingtemperature: "Operating temperature",
  operatinghumidity: "Operating humidity",
  workinghumidity: "Operating humidity",
  power: "Power supply",
  powersupply: "Power supply",
  powerrequirements: "Power supply",
  inputvoltage: "Power supply",
  recommendedpowersupply: "Power supply",
  standardfunction: "Standard functions",
  standardfunctions: "Standard functions",
  optionalfunctions: "Optional functions",
  model: "Model",
  productmodel: "Model",
  cardholderscapacity: "Card holder capacity",
  typesofreaderssupported: "Reader types supported",
  numbersofreaderssupported: "Readers supported",
  numberofreaderssupported: "Readers supported",
  numberofdoorscontroller: "Doors controlled",
  numberofdoorscontrolled: "Doors controlled",
  lanewidth: "Lane width",
  lanewidthmm: "Lane width",
  footprint: "Footprint",
  footprintmmmm: "Footprint",
  ledindicator: "LED indicator",
  authentication: "Verification methods",
  authenticationmethods: "Verification methods",
  logeventscapacity: "Event log capacity",
  transactioncapacity: "Transaction capacity",
  ostsupported: "Operating system",
  ossupported: "Operating system",
  os: "Operating system",
  operatingsystem: "Operating system",
};

function labelKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Sentence-case a label unless it contains an acronym such as "LED" or "ID". */
function sentenceCase(s: string): string {
  return s
    .split(" ")
    .map((w, i) => {
      if (/^[A-Z0-9.\-/()]{2,}$/.test(w)) return w; // LED, ID, RS485, (W×D×H)
      if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      return w.toLowerCase();
    })
    .join(" ");
}

export function canonicalLabel(raw: string): string {
  const tidy = tidyLabel(raw);
  return LABEL_MAP[labelKey(tidy)] ?? sentenceCase(tidy);
}

/** Labels that are page furniture rather than specifications. */
const DROP_LABELS = new Set(["brand", "productname", "producttype", "devicetype"]);
const HEADER_VALUES = new Set(["specification", "specifications", "details", "value", "description"]);

export function normaliseSpecs(groups: { title: string; rows: [string, string][] }[]): SpecGroup[] {
  const out: SpecGroup[] = [];
  for (const g of groups) {
    const seen = new Set<string>();
    const rows: SpecRow[] = [];
    for (const [rawLabel, rawValue] of g.rows) {
      const value = cleanText(rawValue);
      const sourceLabel = tidyLabel(rawLabel);
      if (!value || !sourceLabel || DROP_LABELS.has(labelKey(sourceLabel))) continue;
      if (HEADER_VALUES.has(labelKey(value))) continue; // a table's header row ("Feature | Specification")
      const label = canonicalLabel(sourceLabel);
      if (seen.has(label)) continue; // first occurrence wins
      seen.add(label);
      rows.push(label === sourceLabel ? { label, value } : { label, value, sourceLabel });
    }
    if (rows.length) out.push({ title: cleanText(g.title) || "Specifications", rows });
  }
  return out;
}

/* ---------- derived facets ---------- */

const METHOD_RULES: [Method, RegExp][] = [
  ["face", /\bface\b|facial|visible light|speedface/i],
  ["palm", /\bpalm\b/i],
  ["fingerprint", /fingerprint|finger ?print|\bfp\b/i],
  ["card", /\b(id|ic|em|rfid|mifare|hid|proximity)\b.*card|\bcard\b|rfid|mifare/i],
  ["qr", /\bqr\b/i],
  ["pin", /\bpin\b|password|keypad/i],
  ["mobile", /mobile credential|bluetooth|\bnfc\b|zkbio ?zlink|app unlock/i],
];

const CONNECTIVITY_RULES: [Connectivity, RegExp][] = [
  ["tcp-ip", /tcp\/?ip|ethernet/i],
  ["wifi", /wi-?fi|wireless lan/i],
  ["4g", /\b4g\b|\blte\b/i],
  ["poe", /\bpoe\b/i],
  ["rs485", /rs-?485|rs232\/485|rs-?232\/485/i],
  ["usb", /\busb\b/i],
  ["wiegand", /wiegand/i],
  ["bluetooth", /bluetooth/i],
];

/** Only facets a buyer filters on; both are derived from name + specs. */
export function deriveFacets(name: string, specs: SpecGroup[]) {
  const specText = specs.flatMap((g) => g.rows.map((r) => `${r.label}: ${r.value}`)).join("\n");
  const verifyText = specs
    .flatMap((g) => g.rows)
    .filter((r) =>
      /capacity|verification|authentication|sensor|card|reader|optional|standard|camera|algorithm/i.test(r.label),
    )
    .map((r) => `${r.label}: ${r.value}`)
    .join("\n");
  const methodSource = `${name}\n${verifyText}`;

  const methods = METHOD_RULES.filter(([, re]) => re.test(methodSource)).map(([m]) => m);
  const connectivity = CONNECTIVITY_RULES.filter(([, re]) => re.test(specText)).map(([c]) => c);
  const outdoor = /\bip6[5-9]\b|outdoor|weather ?proof|all[- ]weather/i.test(`${name}\n${specText}`);
  return { methods, connectivity, outdoor };
}

/* ---------- identity ---------- */

export function deriveBrand(name: string, categories: string[]): "zkteco" | "alpha" | "other" {
  if (categories.includes("alpha") || /^alpha\b|\balf[- ]/i.test(name)) return "alpha";
  return "zkteco";
}

/** "ZKTeco SpeedFace-V5L [QR]" → "SpeedFace-V5L [QR]"; "Alpha AL-M280" → "AL-M280". */
export function deriveModel(name: string): string {
  return cleanText(name.replace(/^(zkteco|zk teco|alpha)\s+/i, ""));
}

/** Displayed name: AIMS often omits the brand, so add it once for ZKTeco devices. */
export function displayName(name: string, brand: "zkteco" | "alpha" | "other"): string {
  const n = cleanText(name);
  if (brand === "zkteco" && !/^zk ?teco\b/i.test(n)) return `ZKTeco ${n}`;
  if (brand === "alpha" && !/^alpha\b/i.test(n)) return `Alpha ${n}`;
  return n.replace(/^zk teco\b/i, "ZKTeco");
}

/* ---------- copy ---------- */

/**
 * Sentences on aimsuae.me that repeat a sales pitch on every product page
 * ("Like ZKTeco F18, you can buy … from AIMS …"). They are dropped from the
 * product overview because the page template already says this once.
 */
const BOILERPLATE = [
  /\blike [^.]{1,80}, you can buy/i,
  /we offer the best services with advanced installation technology/i,
];

export function stripBoilerplate(text: string): string {
  return BOILERPLATE.reduce((t, re) => {
    const idx = t.search(re);
    return idx >= 0 ? t.slice(0, idx).trim() : t;
  }, text);
}

/** Splits "• a • b • c" bullet runs (as used in AIMS overviews) into a list. */
export function bulletsToBlocks(text: string): Block[] {
  const t = cleanText(text);
  if (!t) return [];
  const parts = t
    .split(/\s*•\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2 && t.trimStart().startsWith("•")) return [{ type: "ul", items: parts }];
  return [{ type: "p", text: t }];
}

/** Shortens text at a word boundary, for meta descriptions and cards. */
export function excerpt(text: string, max = 160): string {
  const t = cleanText(text.replace(/•/g, ""));
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/* ---------- duplicates ---------- */

/** Stable signature for spotting the same product published twice. */
export function productSignature(name: string, specs: SpecGroup[]): string {
  const rows = specs
    .flatMap((g) => g.rows)
    .map((r) => `${labelKey(r.label)}=${labelKey(r.value)}`)
    .sort()
    .join("|");
  return `${labelKey(deriveModel(name))}#${rows}`;
}

/** Key for matching the same model across slugs ("BioPro MH20" = "Biopro MH20"). */
export function modelKey(model: string): string {
  return labelKey(model);
}

/** "f18-1" ~ "f18", "biopro-sa20" ~ "bio-pro-sa20". */
export function isSlugVariant(a: string, b: string): boolean {
  const k = (s: string) => s.replace(/-\d+$/, "").replace(/-/g, "");
  return k(a) === k(b);
}
