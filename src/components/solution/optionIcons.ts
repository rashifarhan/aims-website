/** Line icons on the 32px explainer grid (Design Doc 7), one per option key. Pages may pass their own path. */
export const OPTION_ICONS = {
  face: "M9 4H6a2 2 0 0 0-2 2v3m19-5h3a2 2 0 0 1 2 2v3M9 28H6a2 2 0 0 1-2-2v-3m19 5h3a2 2 0 0 0 2-2v-3M12 13v1m8-1v1m-6 6c1.5 1.3 3.5 1.3 5 0M16 13v4",
  fingerprint:
    "M10 25c1.5-2.5 2-5.5 2-9a4 4 0 0 1 8 0c0 2 0 4-.5 6M8 8a11 11 0 0 1 19 6c0 3-.3 6-1 8.5M5 14a11 11 0 0 1 1.5-4M16 16c0 4-1 8-3 11m7-6c-.4 2.3-1.1 4.4-2 6.3",
  card: "M4 9a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm0 4h24M8 20h6",
  mobile:
    "M10 4h12a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 20h4M12 11h3v3h-3Zm5 0h3v3h-3Zm-5 5h3v3h-3Zm5 2h3",
  palm: "M11 18V8a1.5 1.5 0 0 1 3 0v8m0-10a1.5 1.5 0 0 1 3 0v10m0-9a1.5 1.5 0 0 1 3 0v10m0-6a1.5 1.5 0 0 1 3 0v9c0 4.5-3.5 8-8 8-3 0-5.4-1.6-7-4.2L6 20a1.6 1.6 0 0 1 2.6-1.8L11 21",
} as const;

export type OptionIconKey = keyof typeof OPTION_ICONS;
