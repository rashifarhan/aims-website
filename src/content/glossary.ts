/**
 * Plain-language hints for spec labels that buyers outside the trade
 * don't know (review decision 3). General explanations of the term only;
 * never a claim about a specific product.
 */
export const SPEC_HINTS: Record<string, string> = {
  "Algorithm version": "The version of the matching software inside the device. Newer versions usually match faster.",
  "Wiegand signal": "A standard wiring format for connecting readers and controllers, including other brands.",
  Communication: "How it connects: TCP/IP is a network cable, RS485 a long wired bus, plus USB or Wi-Fi where listed.",
  "Access control interface":
    "Door hardware the device can drive directly, such as a lock, door sensor or exit button.",
  "Transaction capacity": "How many clock-in or door events the device stores before they need downloading.",
  "Record capacity": "How many clock-in or door events the device stores before they need downloading.",
  "Event log capacity": "How many door events the controller stores before they need downloading.",
  "Card holder capacity": "How many card users the controller can store.",
  "Readers supported": "How many card or biometric readers can be connected to the controller.",
  "Doors controlled": "How many doors one controller manages.",
  "Holding force": "The force a magnetic lock resists when locked. Higher values hold heavier doors.",
  "Lane width": "The clear width people or vehicles pass through.",
  MCBF: "Mean cycles between failures: the average number of openings before a fault.",
  "Optional functions": "Features available when the device is ordered with that option.",
  "Standard functions": "Features included as standard.",
  "Aux. input": "An extra input for a sensor or alarm contact.",
  "Door thickness": "The range of door thickness the lock fits.",
  Sensor: "The type of fingerprint scanner.",
};

export const specHint = (label: string): string | undefined => SPEC_HINTS[label];
