// /app/lib/places.ts
import { locations } from '../data/locations'

export const PLACES_REVALIDATE = 60 * 60 * 6 // 6h

async function fetchHours(placeId: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  const fields = ['regularOpeningHours', 'currentOpeningHours', 'utcOffsetMinutes'].join(',')
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&languageCode=de&regionCode=DE&key=${key}`

  const res = await fetch(url, { next: { revalidate: PLACES_REVALIDATE } })
  if (!res.ok) {
    const txt = await res.text()
    console.error('Places ERROR', res.status, txt)
    return null
  }
  return res.json()
}

export async function readPlacesHours() {
  const out: Record<string, any> = {}
  for (const [key, cfg] of Object.entries(locations)) {
    let data = null
    try {
      data = cfg.placeId ? await fetchHours(cfg.placeId) : null
    } catch {}

    out[key] = {
      label: cfg.label,
      source: data ? 'google' : 'fallback (Öffnungszeiten können abweichen)',
      opening_hours: (data as any)?.regularOpeningHours || null,
      current_opening_hours: (data as any)?.currentOpeningHours || null,
      fallback: (cfg as any).fallback,
    }
  }
  return out as { mettingen: any; recke: any }
}
