// /app/types/events.ts
export type EventDto = {
  id: string;
  title: string;
  start: string;   // ISO
  end?: string;    // ISO
  location?: string;
  description?: string;
  category?: string;
  priceCents?: number;
  imageUrl?: string;
  registrationUrl?: string;
  seatsLeft?: number;
  isFeatured?: boolean;
};
