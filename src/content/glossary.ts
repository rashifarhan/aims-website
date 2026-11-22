import en from "@/i18n/messages/en.json";

/** The hint texts live in the dictionaries (product.specHints) so Arabic pages get them too. */
export type SpecHints = typeof en.product.specHints;

/**
 * Plain-language hints for spec labels that buyers outside the trade
 * don't know (review decision 3). Keyed by the verbatim spec label; the
 * text is a general explanation of the term, never a claim about a
 * specific product.
 */
const HINT_KEYS: Record<string, keyof SpecHints> = {
  "Algorithm version": "algorithmVersion",
  "Wiegand signal": "wiegandSignal",
  Communication: "communication",
  "Access control interface": "accessControlInterface",
  "Transaction capacity": "eventCapacity",
  "Record capacity": "eventCapacity",
  "Event log capacity": "eventLogCapacity",
  "Card holder capacity": "cardHolderCapacity",
  "Readers supported": "readersSupported",
  "Doors controlled": "doorsControlled",
  "Holding force": "holdingForce",
  "Lane width": "laneWidth",
  MCBF: "mcbf",
  "Optional functions": "optionalFunctions",
  "Standard functions": "standardFunctions",
  "Aux. input": "auxInput",
  "Door thickness": "doorThickness",
  Sensor: "sensor",
};

/** Pass the page's own `t.product.specHints`; English is the default for callers without a locale. */
export function specHint(label: string, hints: SpecHints = en.product.specHints): string | undefined {
  const key = HINT_KEYS[label];
  return key ? hints[key] : undefined;
}
