import localFont from "next/font/local";

/** Self-hosted (no request to Google at build or run time). OFL licences in ./fonts. */
export const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

export const plexArabic = localFont({
  src: [
    // Two weights, not four (AT-11 on throttled Arabic pages): 500 falls back to 400 and 600 to 700 by
    // the CSS font-matching rules, saving about 90 KB on every Arabic page.
    { path: "./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false, // only Arabic pages need it
});
