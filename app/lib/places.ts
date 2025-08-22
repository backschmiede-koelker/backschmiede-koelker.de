import { locations } from '../data/locations';

export const PLACES_REVALIDATE = 60 * 60 * 6; // 6h

async function fetchHours(placeId: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const fields = ['opening_hours','current_opening_hours','utc_offset_minutes'].join(',');
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${key}`;
  const res = await fetch(url, { next: { revalidate: PLACES_REVALIDATE } });
  if (!res.ok) return null;
  return res.json();
}

export async function readPlacesHours() {
  const out: Record<string, any> = {};
  for (const [key, cfg] of Object.entries(locations)) {
    let data = null;
    try {
      data = cfg.placeId ? await fetchHours(cfg.placeId) : null;
    } catch {}
    out[key] = {
      label: cfg.label,
      source: data ? 'google-places' : 'fallback',
      opening_hours: (data as any)?.openingHours || null,
      current_opening_hours: (data as any)?.currentOpeningHours || null,
      fallback: (cfg as any).fallback,
    };
  }
  return out as {
    mettingen: any;
    recke: any;
  };
}