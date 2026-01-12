import crypto from "crypto";

export const ANALYTICS_TTL_SECONDS = 60 * 60 * 24 * 365;
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

/**
 * Grobe UA-Klassifizierung (ohne Versionen).
 * Wir speichern den UA NICHT, sondern nur diese Familien als aggregierte Zähler.
 */
export function browserFamilyFromUA(ua: string | null): string {
  const s = (ua || "").toLowerCase();

  // Reihenfolge ist wichtig (Edge enthält "chrome", Opera enthält "chrome" etc.)
  if (s.includes("edg/") || s.includes("edge/")) return "edge";
  if (s.includes("opr/") || s.includes("opera")) return "opera";
  if (s.includes("brave")) return "brave";
  if (s.includes("vivaldi")) return "vivaldi";
  if (s.includes("firefox/")) return "firefox";

  // Safari kommt oft mit "version/x safari/..." und iOS WebViews etc.
  const isSafari = s.includes("safari") && !s.includes("chrome") && !s.includes("chromium") && !s.includes("crios");
  if (isSafari) return "safari";

  // Chrome-Familie (inkl. iOS Chrome = crios)
  if (s.includes("chrome") || s.includes("chromium") || s.includes("crios")) return "chrome";

  // Samsung Internet
  if (s.includes("samsungbrowser")) return "samsung";

  // Android WebView
  if (s.includes("wv") || s.includes("android") && s.includes("version/")) return "webview";

  return "other";
}

export function osFamilyFromUA(ua: string | null): string {
  const s = (ua || "").toLowerCase();

  if (s.includes("iphone") || s.includes("ipad") || s.includes("ipod") || s.includes("ios")) return "ios";
  if (s.includes("android")) return "android";
  if (s.includes("windows")) return "windows";
  if (s.includes("mac os x") || s.includes("macintosh")) return "macos";
  if (s.includes("linux")) return "linux";

  return "other";
}

/**
 * Performance: Histogramm-Buckets (ms). Grob genug, um Fingerprinting zu vermeiden.
 */
export const PERF_BUCKETS_MS = [25, 50, 100, 200, 400, 800, 1500, 3000, 6000] as const;

export function perfBucketLabel(ms: number): string {
  const b = PERF_BUCKETS_MS;
  if (ms <= b[0]) return `0-${b[0]}`;
  for (let i = 1; i < b.length; i++) {
    if (ms <= b[i]) return `${b[i - 1] + 1}-${b[i]}`;
  }
  return `${b[b.length - 1] + 1}+`;
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
    browser: `${prefix}pv:browser:${day}`,
    os: `${prefix}pv:os:${day}`,

    // Performance (aggregiert)
    perfHist: `${prefix}perf:hist:${day}`, // bucket -> count
    perfSumMs: `${prefix}perf:sum_ms:${day}`, // string number
    perfCount: `${prefix}perf:count:${day}`, // string number

    // Performance pro Path: avg = sum/count (keine Per-User Daten)
    perfPathSumMs: `${prefix}perf:path:sum_ms:${day}`, // hash: path -> sum
    perfPathCount: `${prefix}perf:path:count:${day}`, // hash: path -> count
  };
}
