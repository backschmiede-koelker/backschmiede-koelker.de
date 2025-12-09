// /app/data/locations.ts
import type { Location } from "@/generated/prisma/client";

export type FallbackHours = {
  weekday_text: string[];
};

export const locations = {
  mettingen: {
    label: "Mettingen",
    placeId: process.env.PLACES_METTINGEN_PLACE_ID!,
    fallback: {
      weekday_text: [
        "Montag: 07:00-12:30 Uhr",
        "Dienstag: 07:00-12:30 Uhr, 14:30-18:00 Uhr",
        "Mittwoch: 07:00-12:30 Uhr, 14:30-18:00 Uhr",
        "Donnerstag: 07:00-12:30 Uhr, 14:30-18:00 Uhr",
        "Freitag: 07:00-12:30 Uhr, 14:30-18:00 Uhr",
        "Samstag: 07:00-12:30 Uhr",
        "Sonntag: 08:00-11:00 Uhr",
      ],
    } as FallbackHours,
  },
  recke: {
    label: "Recke",
    placeId: process.env.PLACES_RECKE_PLACE_ID!,
    fallback: {
      weekday_text: [
        "Montag: 06:00-18:00 Uhr",
        "Dienstag: 06:00-18:00 Uhr",
        "Mittwoch: 06:00-18:00 Uhr",
        "Donnerstag: 06:00-18:00 Uhr",
        "Freitag: 06:00-18:00 Uhr",
        "Samstag: 06:00-18:00 Uhr",
        "Sonntag: 07:00-17:00 Uhr",
      ],
    } as FallbackHours,
  },
} as const;

export type LocationKey = keyof typeof locations;

export const LocationKeyToEnum: Record<LocationKey, Location> = {
  mettingen: "METTINGEN",
  recke: "RECKE",
};

export const LocationEnumToKey: Record<Location, LocationKey> = {
  METTINGEN: "mettingen",
  RECKE: "recke",
};

export function toEnumArray(keys: LocationKey[]): Location[] {
  return keys.map(k => LocationKeyToEnum[k]);
}

export function toKeyArray(enums: Location[]): LocationKey[] {
  return enums.map(e => LocationEnumToKey[e]);
}
