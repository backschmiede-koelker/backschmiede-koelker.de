// lib/offers.ts
export type LocationKey = 'RECKE' | 'METTINGEN' | 'BOTH';

export type Offer = {
  id: string;                  // slug/uuid
  title: string;               // z.B. "Dinkel-Kruste"
  price?: number | null;       // EUR (optional)
  unit?: string | null;        // z.B. "pro Stück", "500 g"
  badge?: string | null;       // z.B. "NEU", "BIO"
  description?: string | null; // Kurztext
  image?: string | null;       // /public/... optional
  tags?: string[];             // ["BROT","DINKEL"]
  locations?: LocationKey[];   // ["RECKE"] | ["METTINGEN"] | ["BOTH"]
  startDate: string;           // ISO "2025-08-18"
  endDate: string;             // ISO "2025-08-24"
};

export type OfferUpsert = Omit<Offer, 'id'> & { id?: string };

export function isActiveInWeek(offer: Offer, weekStart: Date, weekEnd: Date) {
  const s = new Date(offer.startDate).getTime();
  const e = new Date(offer.endDate).getTime();
  return e >= weekStart.getTime() && s <= weekEnd.getTime();
}

export function formatEUR(v?: number | null) {
  if (typeof v === 'number') {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v);
  }
  return '';
}

export const LOCS: readonly LocationKey[] = ['BOTH','RECKE','METTINGEN'] as const;
