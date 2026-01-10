// app/lib/uploads.ts
// CLIENT-SAFE - keine Node-APIs importieren!

/**
 * Normalisiert beliebige Eingaben (abs./rel.) auf einen DB-Speicherwert
 * "folder/file.ext" (ohne führenden Slash, ohne "uploads/").
 */
export function toStoredPath(input?: string | null): string | null {
  if (!input) return null;
  let s = String(input).trim();
  if (!s) return null;

  if (/^https?:\/\//i.test(s)) {
    try { s = new URL(s).pathname || ""; } catch { return null; }
  }
  s = s.replace(/^\/+/, "");
  if (s.toLowerCase().startsWith("uploads/")) s = s.slice("uploads/".length);
  return s || null;
}

/**
 * Öffentliche URL für ein Bild aus DB-Wert oder rohem Pfad.
 * - Mit NEXT_PUBLIC_BASE_ASSET_URL (CDN-Host) → `${BASE}/${stored}`
 * - Ohne BASE → Fallback auf App-Pfad `/uploads/${stored}`
 * - Bereits absolute/data/blob-URLs werden unverändert zurückgegeben.
 */
export function publicAssetUrl(u?: string | null): string | null {
  if (!u) return null;
  const s = String(u).trim();
  if (!s) return null;
  if (/^(https?:|data:|blob:)/i.test(s)) return s;

  const stored = toStoredPath(s);
  if (!stored) return null;

  const base = (process.env.NEXT_PUBLIC_BASE_ASSET_URL || "").replace(/\/+$/, "");
  // Wichtig: CDN zeigt direkt auf den uploads-Root, daher KEIN "/uploads" hier!
  return base ? `${base}/${stored}` : `/uploads/${stored}`;
}

/** Nur der Pfadteil mit '/uploads/' - falls du mal ohne Host rendern willst. */
export function uploadsPath(u?: string | null): string | null {
  const stored = toStoredPath(u);
  return stored ? `/uploads/${stored}` : null;
}
