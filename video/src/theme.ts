import { staticFile } from "remotion";

// AIMS tokens (src/app/globals.css), so the films and the page are one palette.
export const C = {
  night950: "#08130d",
  night900: "#0f1f17",
  night800: "#102619",
  night700: "#1e3a2e",
  nightLine: "#24432f",
  nightText: "#e9f2ec",
  nightMuted: "#a9bdb0",
  green700: "#26703a",
  lime: "#78be20",
};

export const fontCss = `
@font-face{font-family:Archivo;src:url(${staticFile("fonts/archivo-latin-standard-normal.woff2")}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Inter;src:url(${staticFile("fonts/inter-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
@font-face{font-family:Plex Mono;src:url(${staticFile("fonts/ibm-plex-mono-latin-400-normal.woff2")}) format("woff2");font-weight:400}
@font-face{font-family:Plex Mono;src:url(${staticFile("fonts/ibm-plex-mono-latin-500-normal.woff2")}) format("woff2");font-weight:500}
`;
