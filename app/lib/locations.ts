// lib/locations.ts
export const LOCATION_OPTIONS = ["RECKE", "METTINGEN"] as const;
export type LocationKey = (typeof LOCATION_OPTIONS)[number];

export function locationLabel(l: LocationKey) {
  return l === "RECKE" ? "Recke" : "Mettingen";
}
