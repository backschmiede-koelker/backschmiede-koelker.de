// app/types/event.ts
export type LocationKey = "RECKE" | "METTINGEN";

export type EventItem = {
  id: string;
  caption: string;
  description?: string | null;
  imageUrl?: string | null;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  locations: LocationKey[];
  createdAt: string;
  updatedAt: string;
};
