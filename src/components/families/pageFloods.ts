import { FAMILY_GROUND } from "./grounds";

/**
 * Each inner page's flood (CLAUDE.md → Design rules: pages are built from family grounds with one giant white word):
 * the word, its advance width in em (measured in Archivo 900 at 125% with the giant tracking, like familyShowcase.ts)
 * and the ground. Pages whose first screen holds a quote control or a status line sit on a dark ground (access, POS,
 * parts), where lime may mark state (Design rules → Palette).
 */
export type PageFlood = { word: string; em: number; ground: string };

export const PAGE_FLOOD = {
  solutions: { word: "SOLUTIONS", em: 7.479, ground: FAMILY_GROUND["entrance-control"] },
  software: { word: "SOFTWARE", em: 7.211, ground: FAMILY_GROUND.pos },
  services: { word: "SERVICE", em: 5.567, ground: FAMILY_GROUND["time-attendance"] },
  about: { word: "AIMS", em: 3.269, ground: FAMILY_GROUND["access-control"] },
  locations: { word: "VISIT", em: 3.312, ground: FAMILY_GROUND["door-locks"] },
  contact: { word: "CONTACT", em: 6.146, ground: FAMILY_GROUND["door-hardware"] },
  quote: { word: "QUOTE", em: 4.537, ground: FAMILY_GROUND["access-control"] },
  support: { word: "SUPPORT", em: 6.174, ground: FAMILY_GROUND["door-hardware"] },
  blog: { word: "NOTES", em: 4.429, ground: FAMILY_GROUND["entrance-control"] },
  compare: { word: "COMPARE", em: 6.432, ground: FAMILY_GROUND["access-control"] },
  legal: { word: "LEGAL", em: 4.223, ground: FAMILY_GROUND["door-hardware"] },
  dubai: { word: "DUBAI", em: 4.026, ground: FAMILY_GROUND["access-control"] },
  oman: { word: "OMAN", em: 4.007, ground: FAMILY_GROUND["access-control"] },
  kenya: { word: "KENYA", em: 4.46, ground: FAMILY_GROUND["access-control"] },
} satisfies Record<string, PageFlood>;
