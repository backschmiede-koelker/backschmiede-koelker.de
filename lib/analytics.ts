import crypto from "crypto";

export const ANALYTICS_TTL_SECONDS = 60 * 60 * 24 * 400;
const MAX_PATH_LENGTH = 120;
const MAX_DIM_LENGTH = 80;
const DAY_MS = 24 * 60 * 60 * 1000;

type AnalyticsConfig = {
  prefix: string;
  masterSecret: string;
};

export function getAnalyticsConfig(): AnalyticsConfig {
  const masterSecret = process.env.ANALYTICS_SECRET;
  const rawPrefix = process.env.ANALYTICS_PREFIX;
  if (!masterSecret) throw new Error("Missing ANALYTICS_SECRET");
  if (!rawPrefix) throw new Error("Missing ANALYTICS_PREFIX");
  const prefix = rawPrefix.endsWith(":") ? rawPrefix : `${rawPrefix}:`;
  return { prefix, masterSecret };
}

export function dayString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function listDays(end: Date, days: number) {
  const out: string[] = [];
  const total = Math.max(1, Math.min(days, 365));
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  for (let i = total - 1; i >= 0; i -= 1) {
    const day = new Date(endDay.getTime() - i * DAY_MS);
    out.push(dayString(day));
  }
  return out;
}

export function parseRange(raw?: string) {
  const r = raw || "30d";
  if (r === "7d") return { range: "7d", days: 7 };
  if (r === "90d") return { range: "90d", days: 90 };
  if (r === "365d") return { range: "365d", days: 365 };
  return { range: "30d", days: 30 };
}

export function deviceClassFromUA(ua: string | null) {
  const s = (ua || "").toLowerCase();
  return /(mobile|iphone|android|ipad|tablet)/i.test(s) ? "mobile" : "desktop";
}

export function languageFromHeader(al: string | null) {
  const raw = (al || "").split(",")[0]?.trim() || "";
  const m = /^[a-z]{2}/i.exec(raw);
  return m ? m[0].toLowerCase() : null;
}

export function sanitizePath(raw: unknown) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const cleaned = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  if (!cleaned.startsWith("/")) return null;
  if (cleaned.startsWith("/admin") || cleaned.startsWith("/api")) return null;
  return cleaned.slice(0, MAX_PATH_LENGTH);
}

export function sanitizeReferrerHost(ref: string | null) {
  try {
    if (!ref) return null;
    const host = new URL(ref).host;
    return sanitizeDimValue(host);
  } catch {
    return null;
  }
}

export function sanitizeDimValue(raw: unknown) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/[^a-z0-9._-]/g, "");
  if (!cleaned) return null;
  return cleaned.slice(0, MAX_DIM_LENGTH);
}

export function dailySecret(masterSecret: string, day: string) {
  return crypto.createHmac("sha256", masterSecret).update(day).digest("base64url");
}

export function uniqueToken(masterSecret: string, day: string, ip: string, deviceClass: string) {
  const secret = dailySecret(masterSecret, day);
  return crypto.createHmac("sha256", secret).update(`${ip}|${deviceClass}`).digest("base64url");
}

export function analyticsKeys(prefix: string, day: string) {
  return {
    pv: `${prefix}pv:${day}`,
    uv: `${prefix}uv:${day}`,
    path: `${prefix}pv:path:${day}`,
    ref: `${prefix}pv:ref:${day}`,
    utmSource: `${prefix}pv:utm_source:${day}`,
    utmMedium: `${prefix}pv:utm_medium:${day}`,
    utmCampaign: `${prefix}pv:utm_campaign:${day}`,
    device: `${prefix}pv:device:${day}`,
    lang: `${prefix}pv:lang:${day}`,
  };
}
