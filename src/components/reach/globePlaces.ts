/**
 * The places the reach globe marks: the same four the reach map names (home.reach): AIMS's offices in Dubai and Abu
 * Dhabi, and the export destinations it names, Muscat and Nairobi. City coordinates are public geography. A review
 * is pinned at the place AIMS published with it; "Oman" is shown at Muscat, its capital.
 */
export type PlaceId = "dubai" | "abuDhabi" | "muscat" | "nairobi";
export type GlobePlace = { id: PlaceId; lat: number; lng: number; office: boolean };

export const GLOBE_PLACES: readonly GlobePlace[] = [
  { id: "dubai", lat: 25.27, lng: 55.3, office: true },
  { id: "abuDhabi", lat: 24.47, lng: 54.37, office: true },
  { id: "muscat", lat: 23.59, lng: 58.41, office: false },
  { id: "nairobi", lat: -1.29, lng: 36.82, office: false },
];

/** Delivery routes drawn as arcs, from the Dubai head office. */
export const GLOBE_ROUTES: readonly [PlaceId, PlaceId][] = [
  ["dubai", "muscat"],
  ["dubai", "nairobi"],
];

/** The published place under each review (lib/site.ts CUSTOMER_REVIEWS) → its pin. */
export const REVIEW_PLACE: Readonly<Record<string, PlaceId>> = {
  "Dubai, UAE": "dubai",
  "Abu Dhabi, UAE": "abuDhabi",
  Oman: "muscat",
};
