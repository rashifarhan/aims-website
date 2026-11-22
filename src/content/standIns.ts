/**
 * Licensed stand-in photographs (CLAUDE.md §2, skill photos.md): context AIMS has not supplied
 * yet, shown until AIMS sends its own. Each is listed in README → Stand-in photographs, credited
 * in the one footer line, and never presented as AIMS's own premises, staff or customers.
 */
export type StandIn = {
  src: string;
  width: number;
  height: number;
  title: string;
  author: string;
  licence: string;
  source: string;
};

export const STAND_INS = {
  magneticLock: {
    src: "/images/stand-ins/magnetic-lock.webp",
    width: 1600,
    height: 1200,
    title: "Magnetic Lock",
    author: "Mooinglemur",
    licence: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Magnetic_Lock.jpg",
  },
  lobbySpeedGates: {
    src: "/images/stand-ins/lobby-speed-gates.webp",
    width: 1600,
    height: 868,
    title: "SlimLane EPR optical turnstiles",
    author: "McGov1258",
    licence: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Automatic_Systems_SlimLane_EPR_Optical_Turnstile_swing_glass_with_QR_reader_and_Elev_Dest_Dispatch.jpg",
  },
} as const satisfies Record<string, StandIn>;
