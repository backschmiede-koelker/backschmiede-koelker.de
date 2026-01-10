// app/lib/uploads.server.ts
// SERVER-ONLY - Dateisystem & absolute URLs aus Server-ENV
import "server-only";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { toStoredPath } from "./uploads";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const SERVER_BASE = (process.env.NEXT_PUBLIC_BASE_ASSET_URL || "").replace(/\/+$/, "");

/** DB-Wert ("folder/file") → absoluter Dateipfad. */
export function pathFromStoredPath(stored?: string | null): string | null {
  const s = toStoredPath(stored);
  if (!s) return null;
  return join(UPLOAD_DIR, s);
}

/**
 * DB-Wert → absolute öffentliche URL.
 * - Mit SERVER_BASE (CDN-Host) → `${BASE}/${stored}`
 * - Ohne BASE → `/uploads/${stored}` (App liefert selbst aus)
 */
export function toAbsoluteAssetUrlServer(input?: string | null): string | null {
  const s = toStoredPath(input);
  if (!s) return null;

  // CDN zeigt auf uploads-Root → kein "/uploads" anhängen
  const cdnPath = `/${s}`;
  const appPath = `/uploads/${s}`;
  return SERVER_BASE ? `${SERVER_BASE}${cdnPath}` : appPath;
}

/**
 * Kandidaten (für Alt-Daten / Vergleiche / Cleanup).
 * Beinhaltet Varianten mit/ohne '/uploads' sowie absolute & eingehende Rohwerte.
 */
export function assetUrlCandidates(input?: string | null): string[] {
  const s = toStoredPath(input);
  if (!s) return [];
  const relApp = `/uploads/${s}`;
  const relCdn = `/${s}`;

  const out = new Set<string>([s, relApp, relCdn]);
  if (SERVER_BASE) {
    out.add(`${SERVER_BASE}${relCdn}`);
    out.add(`${SERVER_BASE}${relApp}`); // falls historische Links so gespeichert wurden
  }
  if (typeof input === "string" && input) out.add(input);
  return Array.from(out);
}

/** Sicheres Löschen auf Dateisystemebene. */
export async function safeUnlink(absPath: string | null) {
  if (!absPath) return false;
  try { await unlink(absPath); return true; }
  catch (e: any) { if (e?.code === "ENOENT") return false; throw e; }
}
